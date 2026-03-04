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
  adminGetProductImages,
  adminAddProductImage,
  adminDeleteProductImage,
} from '@/repositories/product.repository';
import type { Product, ProductImage } from '@/types';

export async function getProducts() {
  return adminGetProducts();
}

export async function getProductById(id: string) {
  return adminGetProductById(id);
}

export async function createProduct(formData: FormData) {
  // Collect all image files
  const imageFiles = formData.getAll('images') as File[];
  const uploadedUrls: string[] = [];
  for (const file of imageFiles) {
    if (file && file.size > 0) {
      const url = await adminUploadProductImage(file);
      uploadedUrls.push(url);
    }
  }
  // Also support single legacy 'image' field
  const singleImage = formData.get('image') as File | null;
  if (singleImage && singleImage.size > 0 && uploadedUrls.length === 0) {
    const url = await adminUploadProductImage(singleImage);
    uploadedUrls.push(url);
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
    images: uploadedUrls,
    is_active: formData.get('is_active') === 'true',
    is_featured: formData.get('is_featured') === 'true',
  };

  const product = await adminCreateProduct(payload as unknown as Omit<Product, 'id' | 'created_at' | 'updated_at'>);

  // Insert into product_images table
  for (const url of uploadedUrls) {
    await adminAddProductImage(product.id, url);
  }

  revalidatePath('/dashboard/products');
  return product;
}

export async function updateProduct(id: string, formData: FormData) {
  // Collect new image files
  const imageFiles = formData.getAll('images') as File[];
  for (const file of imageFiles) {
    if (file && file.size > 0) {
      const url = await adminUploadProductImage(file);
      await adminAddProductImage(id, url);
    }
  }
  // Also support single legacy 'image' field
  const singleImage = formData.get('image') as File | null;
  if (singleImage && singleImage.size > 0 && imageFiles.filter(f => f.size > 0).length === 0) {
    const url = await adminUploadProductImage(singleImage);
    await adminAddProductImage(id, url);
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

export async function getProductImages(productId: string): Promise<ProductImage[]> {
  return adminGetProductImages(productId);
}

export async function addProductImage(productId: string, formData: FormData): Promise<ProductImage> {
  const file = formData.get('file') as File;
  if (!file || file.size === 0) throw new Error('No file provided');
  const url = await adminUploadProductImage(file);
  const img = await adminAddProductImage(productId, url);
  revalidatePath('/dashboard/products');
  revalidatePath(`/dashboard/products/${productId}`);
  return img;
}

export async function deleteProductImage(imageId: string) {
  await adminDeleteProductImage(imageId);
  revalidatePath('/dashboard/products');
}
