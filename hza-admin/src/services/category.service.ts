'use server';

import { revalidatePath } from 'next/cache';
import {
  adminGetCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  adminUploadCategoryImage,
} from '@/repositories/category.repository';
import type { Category } from '@/types';

export async function getCategories() {
  return adminGetCategories();
}

export async function createCategory(formData: FormData) {
  const imageFile = formData.get('image') as File | null;
  let image_url: string | undefined;
  if (imageFile && imageFile.size > 0) {
    image_url = await adminUploadCategoryImage(imageFile);
  }

  const rawParentId = formData.get('parent_id') as string | null;

  const payload: Omit<Category, 'id' | 'created_at'> = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    description: (formData.get('description') as string) || null,
    image_url: image_url ?? null,
    is_active: formData.get('is_active') === 'true',
    sort_order: 0,
    parent_id: rawParentId && rawParentId.trim() ? rawParentId.trim() : null,
    default_shipping_category: (formData.get('default_shipping_category') as string || 'small_parcel') as Category['default_shipping_category'],
    updated_at: new Date().toISOString(),
  };

  const category = await adminCreateCategory(payload);
  revalidatePath('/dashboard/categories');
  return category;
}

export async function updateCategory(id: string, formData: FormData) {
  const imageFile = formData.get('image') as File | null;
  let image_url: string | undefined;
  if (imageFile && imageFile.size > 0) {
    image_url = await adminUploadCategoryImage(imageFile);
  }

  const rawParentId = formData.get('parent_id') as string | null;

  const payload: Partial<Category> = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    description: (formData.get('description') as string) || null,
    is_active: formData.get('is_active') === 'true',
    parent_id: rawParentId && rawParentId.trim() ? rawParentId.trim() : null,
    default_shipping_category: (formData.get('default_shipping_category') as string || 'small_parcel') as Category['default_shipping_category'],
  };
  if (image_url) payload.image_url = image_url;

  const category = await adminUpdateCategory(id, payload);
  revalidatePath('/dashboard/categories');
  return category;
}

export async function deleteCategory(id: string) {
  await adminDeleteCategory(id);
  revalidatePath('/dashboard/categories');
}
