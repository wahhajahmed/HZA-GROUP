'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ProductRepository } from '@/repositories/product.repository';
import type { ApiResponse, Product, PaginatedResponse } from '@/types';
import type { ProductSchema } from '@/lib/validations/product';
import { SUPABASE_BUCKETS } from '@/lib/constants';
import { slugify } from '@/lib/utils';

async function getRepo() {
  const supabase = await createClient();
  return { repo: new ProductRepository(supabase), supabase };
}

export async function getFeaturedProducts(): Promise<ApiResponse<Product[]>> {
  try {
    const { repo } = await getRepo();
    const data = await repo.findFeatured(8);
    return { data, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function getProductBySlug(
  slug: string
): Promise<ApiResponse<Product>> {
  try {
    const { repo } = await getRepo();
    const data = await repo.findBySlug(slug);
    if (!data) return { data: null, error: 'Product not found' };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function getProductsByCategory(
  categoryId: string,
  page = 1,
  pageSize = 12
): Promise<ApiResponse<PaginatedResponse<Product>>> {
  try {
    const { repo } = await getRepo();
    const data = await repo.findByCategory(categoryId, page, pageSize);
    return { data, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function getAllProducts(
  pageOrOpts: number | { page?: number; limit?: number; search?: string } = 1,
  pageSize = 12,
  search?: string
): Promise<ApiResponse<PaginatedResponse<Product>>> {
  try {
    const { repo } = await getRepo();
    let page = 1;
    let size = pageSize;
    let q = search;
    if (typeof pageOrOpts === 'object') {
      page = pageOrOpts.page || 1;
      size = pageOrOpts.limit || 12;
      q = pageOrOpts.search;
    } else {
      page = pageOrOpts;
    }
    const data = await repo.findAll(page, size, q);
    return { data, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

// ==================== ADMIN ====================

export async function adminGetProducts(
  opts?: {
    query?: string
    page?: number
    limit?: number
    filter?: string
  }
): Promise<ApiResponse<Product[]> & { total?: number }> {
  try {
    const { repo } = await getRepo();
    const page = opts?.page || 1
    const pageSize = opts?.limit || 20
    const result = await repo.adminFindAll(page, pageSize, opts?.query, opts?.filter);
    return { data: result.data, error: null, total: result.count }
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function adminGetProductById(
  id: string
): Promise<ApiResponse<Product>> {
  try {
    const { repo } = await getRepo();
    const data = await repo.adminFindById(id);
    if (!data) return { data: null, error: 'Product not found' };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function adminCreateProduct(
  input: ProductSchema
): Promise<ApiResponse<Product>> {
  try {
    const { repo } = await getRepo();

    const slug = input.slug || slugify(input.name);

    const data = await repo.create({
      ...input,
      slug,
      discount_price: input.discount_price ?? null,
      sku: input.sku ?? null,
      category_id: input.category_id ?? null,
      meta_title: input.meta_title ?? null,
      meta_description: input.meta_description ?? null,
      description: input.description ?? null,
      shipping_category: (input as any).shipping_category ?? 'small_parcel',
    });

    // Purge Next.js cache so storefront reflects new product immediately
    revalidatePath('/');
    revalidatePath('/admin/products');
    return { data, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function adminUpdateProduct(
  id: string,
  input: Partial<ProductSchema>
): Promise<ApiResponse<Product>> {
  try {
    const { repo } = await getRepo();
    const data = await repo.update(id, input);
    revalidatePath('/');
    revalidatePath('/admin/products');
    if (data?.slug) revalidatePath(`/products/${data.slug}`);
    return { data, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function adminDeleteProduct(
  id: string
): Promise<ApiResponse<null>> {
  try {
    const { repo } = await getRepo();
    await repo.delete(id);
    revalidatePath('/');
    revalidatePath('/admin/products');
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function uploadProductImage(
  formData: FormData
): Promise<ApiResponse<string>> {
  try {
    const { supabase } = await getRepo();
    const file = formData.get('file') as File;
    if (!file) return { data: null, error: 'No file provided' };

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { error } = await supabase.storage
      .from(SUPABASE_BUCKETS.PRODUCTS)
      .upload(fileName, file, { upsert: false });

    if (error) throw new Error(error.message);

    const { data: urlData } = supabase.storage
      .from(SUPABASE_BUCKETS.PRODUCTS)
      .getPublicUrl(fileName);

    return { data: urlData.publicUrl, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}
