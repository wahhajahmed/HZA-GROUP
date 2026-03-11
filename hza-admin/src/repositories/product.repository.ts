'use server';

import { createClient } from '@/lib/supabase/server';
import type { Product, ProductImage, ProductVariant, VariantImage, ProductSize } from '@/types';

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
    .select(`
      *,
      category:categories(name, id, slug),
      variants:product_variants(*, images:variant_images(*)),
      sizes:product_sizes(*)
    `)
    .eq('id', id)
    .single();
  if (error) return null;
  return data as Product;
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

// ─────────────────────────────────────────────
// VARIANT CRUD
// ─────────────────────────────────────────────

export async function adminGetProductVariants(productId: string): Promise<ProductVariant[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('product_variants')
    .select('*, images:variant_images(*)')
    .eq('product_id', productId)
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as ProductVariant[];
}

export async function adminCreateVariant(
  productId: string,
  colorName: string,
  colorHex: string,
  sortOrder = 0,
): Promise<ProductVariant> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('product_variants')
    .insert({ product_id: productId, color_name: colorName, color_hex: colorHex, sort_order: sortOrder })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as ProductVariant;
}

export async function adminDeleteVariant(variantId: string): Promise<void> {
  const supabase = await createClient();
  // Fetch variant images to clean up storage
  const { data: imgs } = await supabase
    .from('variant_images')
    .select('image_url')
    .eq('variant_id', variantId);
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
  const { error } = await supabase.from('product_variants').delete().eq('id', variantId);
  if (error) throw new Error(error.message);
}

export async function adminUploadVariantImage(file: File): Promise<string> {
  const supabase = await createClient();
  const ext = file.name.split('.').pop();
  const path = `variant-images/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return data.publicUrl;
}

export async function adminAddVariantImage(variantId: string, imageUrl: string, sortOrder = 0): Promise<VariantImage> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('variant_images')
    .insert({ variant_id: variantId, image_url: imageUrl, sort_order: sortOrder })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as VariantImage;
}

export async function adminDeleteVariantImage(imageId: string): Promise<void> {
  const supabase = await createClient();
  const { data: img, error: fetchErr } = await supabase
    .from('variant_images')
    .select('*')
    .eq('id', imageId)
    .single();
  if (fetchErr || !img) throw new Error('Variant image not found');
  const marker = '/product-images/';
  const idx = (img.image_url as string).indexOf(marker);
  if (idx !== -1) {
    const storagePath = (img.image_url as string).substring(idx + marker.length);
    await supabase.storage.from('product-images').remove([storagePath]);
  }
  const { error } = await supabase.from('variant_images').delete().eq('id', imageId);
  if (error) throw new Error(error.message);
}

// ─────────────────────────────────────────────
// SIZE CRUD
// ─────────────────────────────────────────────

export async function adminGetProductSizes(productId: string): Promise<ProductSize[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('product_sizes')
    .select('*')
    .eq('product_id', productId)
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as ProductSize[];
}

export async function adminSetProductSizes(productId: string, sizes: string[]): Promise<void> {
  const supabase = await createClient();
  // Delete existing sizes then re-insert
  await supabase.from('product_sizes').delete().eq('product_id', productId);
  if (sizes.length === 0) return;
  const rows = sizes.map((size, idx) => ({ product_id: productId, size, sort_order: idx }));
  const { error } = await supabase.from('product_sizes').insert(rows);
  if (error) throw new Error(error.message);
}
