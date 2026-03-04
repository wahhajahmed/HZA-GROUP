'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  adminGetProducts,
  adminGetProductById,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminUploadProductImage,
  adminRemoveProductImage,
} from '@/repositories/product.repository';
import type { Product } from '@/types';

export async function getProducts() {
  return adminGetProducts();
}

export async function getProductById(id: string) {
  return adminGetProductById(id);
}

export async function createProduct(formData: FormData) {
  const imageFile = formData.get('image') as File | null;
  let image_url: string | undefined;
  if (imageFile && imageFile.size > 0) {
    image_url = await adminUploadProductImage(imageFile);
  }

  const payload: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category'> = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    description: formData.get('description') as string || null,
    price: Number(formData.get('price')),
    discount_price: formData.get('discount_price') ? Number(formData.get('discount_price')) : null,
    stock: Number(formData.get('stock')),
    sku: null,
    meta_title: null,
    meta_description: null,
    category_id: formData.get('category_id') as string || null,
    shipping_category: (formData.get('shipping_category') as string || 'small_parcel') as import('@/types').ShippingCategory,
    images: image_url ? [image_url] : [],
    is_active: formData.get('is_active') === 'true',
    is_featured: formData.get('is_featured') === 'true',
  };

  const product = await adminCreateProduct(payload as unknown as Omit<Product, 'id' | 'created_at' | 'updated_at'>);
  revalidatePath('/dashboard/products');
  return product;
}

export async function updateProduct(id: string, formData: FormData) {
  const imageFile = formData.get('image') as File | null;
  let image_url: string | undefined;
  if (imageFile && imageFile.size > 0) {
    image_url = await adminUploadProductImage(imageFile);
  }

  const payload: Partial<Product> = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    description: formData.get('description') as string || null,
    price: Number(formData.get('price')),
    discount_price: formData.get('discount_price') ? Number(formData.get('discount_price')) : null,
    stock: Number(formData.get('stock')),
    category_id: formData.get('category_id') as string || null,
    shipping_category: (formData.get('shipping_category') as string || 'small_parcel') as import('@/types').ShippingCategory,
    is_active: formData.get('is_active') === 'true',
    is_featured: formData.get('is_featured') === 'true',
  };
  if (image_url) payload.images = [image_url];

  const product = await adminUpdateProduct(id, payload);
  revalidatePath('/dashboard/products');
  revalidatePath(`/dashboard/products/${id}`);
  return product;
}

export async function deleteProduct(id: string) {
  await adminDeleteProduct(id);
  revalidatePath('/dashboard/products');
}

export async function removeProductImage(productId: string, imageUrl: string) {
  await adminRemoveProductImage(productId, imageUrl);
  revalidatePath('/dashboard/products');
  revalidatePath(`/dashboard/products/${productId}`);
}
