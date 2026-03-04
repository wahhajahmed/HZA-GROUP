'use server';

import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/types';

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
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function adminUploadProductImage(file: File): Promise<string> {
  const supabase = await createClient();
  const ext = file.name.split('.').pop();
  const path = `products/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return data.publicUrl;
}

export async function adminRemoveProductImage(productId: string, imageUrl: string): Promise<void> {
  const supabase = await createClient();

  // Extract storage path from public URL
  // URL format: .../storage/v1/object/public/product-images/products/1234.jpg
  const marker = '/product-images/';
  const idx = imageUrl.indexOf(marker);
  if (idx !== -1) {
    const storagePath = imageUrl.substring(idx + marker.length);
    await supabase.storage.from('product-images').remove([storagePath]);
  }

  // Remove the image URL from the images array in the database
  // Fetch current images, filter out the removed one, update
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
