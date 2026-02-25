'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { CategoryRepository } from '@/repositories/category.repository';
import { ProductRepository } from '@/repositories/product.repository';
import type { ApiResponse, Category, Product, PaginatedResponse } from '@/types';
import type { CategorySchema } from '@/lib/validations/product';
import { SUPABASE_BUCKETS } from '@/lib/constants';
import { slugify } from '@/lib/utils';
import { getDescendantIds, getAncestors, getChildren } from '@/lib/category-tree';

async function getRepo() {
  const supabase = await createClient();
  return {
    repo: new CategoryRepository(supabase),
    products: new ProductRepository(supabase),
    supabase,
  };
}

/** All active categories (flat) â€” for building trees client/server side */
export async function getCategories(): Promise<ApiResponse<Category[]>> {
  try {
    const { repo } = await getRepo();
    const data = await repo.findAll();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function getCategoryBySlug(
  slug: string
): Promise<ApiResponse<Category>> {
  try {
    const { repo } = await getRepo();
    const data = await repo.findBySlug(slug);
    if (!data) return { data: null, error: 'Category not found' };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export interface CategoryPageData {
  category: Category;
  allCategories: Category[];
  ancestors: Category[];
  children: Category[];
  productCounts: Record<string, number>;
  products: PaginatedResponse<Product>;
  filteredCategory: Category | null; // active sub-filter
}

/**
 * All-in-one loader for /categories/[slug] page.
 * Loads the category, its full hierarchy, product counts per child,
 * and the products filtered to the active sub-slug or all descendants.
 */
export async function getCategoryPageData(
  slug: string,
  subSlug: string | null,
  page = 1
): Promise<ApiResponse<CategoryPageData>> {
  try {
    const { repo, products } = await getRepo();

    // 1. All active categories (flat, for tree building)
    const allCategories = await repo.findAll();

    // 2. Find the requested category
    const category = allCategories.find((c) => c.slug === slug) ?? null;
    if (!category) return { data: null, error: 'Category not found' };

    // 3. Ancestors for breadcrumb
    const ancestors = getAncestors(allCategories, category.id);

    // 4. Direct children
    const children = getChildren(allCategories, category.id);

    // 5. Find filtered sub-category (if any sub-slug selected)
    const filteredCategory = subSlug
      ? allCategories.find((c) => c.slug === subSlug) ?? null
      : null;

    // 6. Determine which category IDs to query products for
    const rootForFilter = filteredCategory ?? category;
    const descendantIds = getDescendantIds(allCategories, rootForFilter.id);

    // 7. Product counts for every child (so we can show count badges in sidebar)
    // Collect all descendant IDs for each child
    const allDescendantIdsForChildren: string[] = [
      ...getDescendantIds(allCategories, category.id),
    ];
    const productCounts = await repo.countProductsForCategories(
      allDescendantIdsForChildren
    );

    // 8. Products paginated
    const productsData = await products.findByCategoryIds(descendantIds, page, 12);

    return {
      data: {
        category,
        allCategories,
        ancestors,
        children,
        productCounts,
        products: productsData,
        filteredCategory,
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

// ==================== ADMIN ====================

export async function adminGetCategories(): Promise<ApiResponse<Category[]>> {
  try {
    const { repo } = await getRepo();
    const data = await repo.adminFindAll();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function adminCreateCategory(
  input: CategorySchema
): Promise<ApiResponse<Category>> {
  try {
    const { repo } = await getRepo();
    const slug = input.slug || slugify(input.name);

    const data = await repo.create({
      ...input,
      slug,
      description: input.description ?? null,
      image_url: input.image_url ?? null,
      parent_id: (input as any).parent_id ?? null,
      default_shipping_category: (input as any).default_shipping_category ?? 'small_parcel',
    });

    revalidatePath('/');
    revalidatePath('/categories');
    revalidatePath('/admin/categories');
    return { data, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function adminUpdateCategory(
  id: string,
  input: Partial<CategorySchema>
): Promise<ApiResponse<Category>> {
  try {
    const { repo } = await getRepo();
    const data = await repo.update(id, input);
    revalidatePath('/');
    revalidatePath('/categories');
    revalidatePath('/admin/categories');
    return { data, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function adminDeleteCategory(
  id: string
): Promise<ApiResponse<null>> {
  try {
    const { repo } = await getRepo();
    await repo.delete(id);
    revalidatePath('/');
    revalidatePath('/categories');
    revalidatePath('/admin/categories');
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function uploadCategoryImage(
  formData: FormData
): Promise<ApiResponse<string>> {
  try {
    const { supabase } = await getRepo();
    const file = formData.get('file') as File;
    if (!file) return { data: null, error: 'No file provided' };

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { error } = await supabase.storage
      .from(SUPABASE_BUCKETS.CATEGORIES)
      .upload(fileName, file, { upsert: false });

    if (error) throw new Error(error.message);

    const { data: urlData } = supabase.storage
      .from(SUPABASE_BUCKETS.CATEGORIES)
      .getPublicUrl(fileName);

    return { data: urlData.publicUrl, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

