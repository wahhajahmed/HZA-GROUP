'use server';

import { createClient } from '@/lib/supabase/server';
import type { Product, ProductImage } from '@/types';

export async function adminGetProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function adminGetProductById(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
}

export async function adminCreateProduct(payload: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminUpdateProduct(id: string, payload: Partial<Product>): Promise<Product> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminDeleteProduct(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: imgs } = await supabase
    .from('product_images')
    .select('image_url')
    .eq('product_id', id);
  if (imgs && imgs.length > 0) {
    const paths = imgs
      .map((i) => {
        const marker = '/product-images/';
        const idx = i.image_url.indexOf(marker);
        return idx !== -1 ? i.image_url.substring(idx + marker.length) : null;
      })
      .filter(Boolean) as string[];
    if (paths.length > 0) {
      await supabase.storage.from('product-images').remove(paths);
    }
  }
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function adminUploadProductImage(file: File): Promise<string> {
  const supabase = await createClient();
  const ext = file.name.split('.').pop();
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return data.publicUrl;
}

export async function adminGetProductImages(productId: string): Promise<ProductImage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', productId)
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function adminAddProductImage(productId: string, imageUrl: string): Promise<ProductImage> {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from('product_images')
    .select('sort_order')
    .eq('product_id', productId)
    .order('sort_order', { ascending: false })
    .limit(1);
  const nextSort = (existing?.[0]?.sort_order ?? -1) + 1;
  const { data, error } = await supabase
    .from('product_images')
    .insert({ product_id: productId, image_url: imageUrl, sort_order: nextSort })
    .select()
    .single();
  if (error) throw new Error(error.message);
  await syncProductImagesArray(productId);
  return data;
}

export async function adminDeleteProductImage(imageId: string): Promise<void> {
  const supabase = await createClient();
  const { data: img, error: fetchErr } = await supabase
    .from('product_images')
    .select('*')
    .eq('id', imageId)
    .single();
  if (fetchErr || !img) throw new Error('Image not found');
  const marker = '/product-images/';
  const idx = img.image_url.indexOf(marker);
  if (idx !== -1) {
    const storagePath = img.image_url.substring(idx + marker.length);
    await supabase.storage.from('product-images').remove([storagePath]);
  }
  const { error } = await supabase.from('product_images').delete().eq('id', imageId);
  if (error) throw new Error(error.message);
  await syncProductImagesArray(img.product_id);
}

export async function adminRemoveProductImage(productId: string, imageUrl: string): Promise<void> {
  const supabase = await createClient();
  const marker = '/product-images/';
  const idx = imageUrl.indexOf(marker);
  if (idx !== -1) {
    const storagePath = imageUrl.substring(idx + marker.length);
    await supabase.storage.from('product-images').remove([storagePath]);
  }
  await supabase.from('product_images').delete().eq('product_id', productId).eq('image_url', imageUrl);
  const { data: product } = await supabase
    .from('products')
    .select('images')
    .eq('id', productId)
    .single();
  const updatedImages = (product?.images ?? []).filter((img: string) => img !== imageUrl);
  const { error } = await supabase
    .from('products')
    .update({ images: updatedImages, updated_at: new Date().toISOString() })
    .eq('id', productId);
  if (error) throw new Error(error.message);
}

async function syncProductImagesArray(productId: string): Promise<void> {
  const supabase = await createClient();
  const { data: imgs } = await supabase
    .from('product_images')
    .select('image_url')
    .eq('product_id', productId)
    .order('sort_order', { ascending: true });
  const urls = (imgs ?? []).map((i) => i.image_url);
  await supabase
    .from('products')
    .update({ images: urls, updated_at: new Date().toISOString() })
    .eq('id', productId);
}
