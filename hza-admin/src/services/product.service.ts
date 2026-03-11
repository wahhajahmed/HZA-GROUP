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
  adminCreateVariant,
  adminDeleteVariant,
  adminUploadVariantImage,
  adminAddVariantImage,
  adminDeleteVariantImage,
  adminSetProductSizes,
} from '@/repositories/product.repository';
import type { Product, ProductImage, VariantImage } from '@/types';

export async function getProducts() {
  return adminGetProducts();
}

export async function getProductById(id: string) {
  return adminGetProductById(id);
}

export async function createProduct(formData: FormData) {
  const hasColors = formData.get('has_colors') === 'true';
  const hasSizes = formData.get('has_sizes') === 'true';

  // ── Simple images (when no color variants) ─────────────
  let uploadedUrls: string[] = [];
  if (!hasColors) {
    const imageFiles = formData.getAll('images') as File[];
    for (const file of imageFiles) {
      if (file && file.size > 0) {
        const url = await adminUploadProductImage(file);
        uploadedUrls.push(url);
      }
    }
    const singleImage = formData.get('image') as File | null;
    if (singleImage && singleImage.size > 0 && uploadedUrls.length === 0) {
      const url = await adminUploadProductImage(singleImage);
      uploadedUrls.push(url);
    }
  }

  const payload: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category' | 'variants' | 'sizes'> = {
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
    has_colors: hasColors,
    has_sizes: hasSizes,
  };

  const product = await adminCreateProduct(payload as unknown as Omit<Product, 'id' | 'created_at' | 'updated_at'>);

  // ── Simple product_images records ──────────────────────
  if (!hasColors) {
    for (const url of uploadedUrls) {
      await adminAddProductImage(product.id, url);
    }
  }

  // ── Color variants ─────────────────────────────────────
  if (hasColors) {
    const variantsJson = formData.get('variants_json') as string | null;
    if (variantsJson) {
      const variants: Array<{ tempId: string; colorName: string; colorHex: string }> = JSON.parse(variantsJson);
      const firstVariantImages: string[] = [];

      for (let vi = 0; vi < variants.length; vi++) {
        const v = variants[vi];
        const variant = await adminCreateVariant(product.id, v.colorName, v.colorHex, vi);
        const files = formData.getAll(`variant_img_${v.tempId}`) as File[];
        for (let fi = 0; fi < files.length; fi++) {
          const file = files[fi];
          if (file && file.size > 0) {
            const url = await adminUploadVariantImage(file);
            await adminAddVariantImage(variant.id, url, fi);
            if (vi === 0) firstVariantImages.push(url);
          }
        }
      }

      // Set first variant's images as the product's main images array (for listings)
      if (firstVariantImages.length > 0) {
        await adminUpdateProduct(product.id, { images: firstVariantImages });
      }
    }
  }

  // ── Sizes ──────────────────────────────────────────────
  if (hasSizes) {
    const sizesJson = formData.get('sizes_json') as string | null;
    if (sizesJson) {
      const sizes: string[] = JSON.parse(sizesJson);
      await adminSetProductSizes(product.id, sizes);
    }
  }

  revalidatePath('/dashboard/products');
  return product;
}

export async function updateProduct(id: string, formData: FormData) {
  const hasColors = formData.get('has_colors') === 'true';
  const hasSizes = formData.get('has_sizes') === 'true';

  // ── Simple images ──────────────────────────────────────
  if (!hasColors) {
    const imageFiles = formData.getAll('images') as File[];
    for (const file of imageFiles) {
      if (file && file.size > 0) {
        const url = await adminUploadProductImage(file);
        await adminAddProductImage(id, url);
      }
    }
    const singleImage = formData.get('image') as File | null;
    if (singleImage && singleImage.size > 0 && imageFiles.filter(f => f.size > 0).length === 0) {
      const url = await adminUploadProductImage(singleImage);
      await adminAddProductImage(id, url);
    }
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
    has_colors: hasColors,
    has_sizes: hasSizes,
  };

  const product = await adminUpdateProduct(id, payload);

  // ── New color variants (additions only; deletes are handled separately) ──
  if (hasColors) {
    const newVariantsJson = formData.get('new_variants_json') as string | null;
    if (newVariantsJson) {
      const newVariants: Array<{ tempId: string; colorName: string; colorHex: string; sortOrder: number }> = JSON.parse(newVariantsJson);
      for (const v of newVariants) {
        const variant = await adminCreateVariant(id, v.colorName, v.colorHex, v.sortOrder);
        const files = formData.getAll(`variant_img_${v.tempId}`) as File[];
        for (let fi = 0; fi < files.length; fi++) {
          const file = files[fi];
          if (file && file.size > 0) {
            const url = await adminUploadVariantImage(file);
            await adminAddVariantImage(variant.id, url, fi);
          }
        }
      }
    }

    // ── New images for existing variants ──
    const existingVariantIds = (formData.get('existing_variant_ids') as string || '').split(',').filter(Boolean);
    for (const vid of existingVariantIds) {
      const files = formData.getAll(`existing_variant_img_${vid}`) as File[];
      for (let fi = 0; fi < files.length; fi++) {
        const file = files[fi];
        if (file && file.size > 0) {
          const url = await adminUploadVariantImage(file);
          await adminAddVariantImage(vid, url, fi);
        }
      }
    }
  }

  // ── Sizes ──────────────────────────────────────────────
  if (hasSizes) {
    const sizesJson = formData.get('sizes_json') as string | null;
    if (sizesJson) {
      const sizes: string[] = JSON.parse(sizesJson);
      await adminSetProductSizes(id, sizes);
    }
  } else {
    // If sizes were turned off, clear them
    await adminSetProductSizes(id, []);
  }

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

// ─────────────────────────────────────────────
// VARIANT / SIZE SERVICE ACTIONS
// ─────────────────────────────────────────────

export async function deleteVariant(variantId: string, productId: string) {
  await adminDeleteVariant(variantId);
  revalidatePath(`/dashboard/products/${productId}`);
}

export async function deleteVariantImage(imageId: string, productId: string) {
  await adminDeleteVariantImage(imageId);
  revalidatePath(`/dashboard/products/${productId}`);
}

export async function addVariantImageAction(
  variantId: string,
  productId: string,
  formData: FormData,
): Promise<VariantImage> {
  const file = formData.get('file') as File;
  if (!file || file.size === 0) throw new Error('No file provided');
  const url = await adminUploadVariantImage(file);
  const img = await adminAddVariantImage(variantId, url);
  revalidatePath(`/dashboard/products/${productId}`);
  return img;
}
