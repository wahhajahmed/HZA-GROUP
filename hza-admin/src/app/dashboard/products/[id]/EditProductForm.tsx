'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { updateProduct, removeProductImage, deleteVariant, deleteVariantImage } from '@/services/product.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ImageOff, Plus, Trash2, Upload } from 'lucide-react';
import { SHIPPING_CATEGORY_OPTIONS } from '@/lib/dc-calculator';
import { buildCategoryTree, flattenTree } from '@/lib/category-tree';
import type { Product, Category, ProductVariant, VariantImage } from '@/types';
import { ColorVariantUploader, type ColorVariantEntry } from '@/components/admin/ColorVariantUploader';
import Image from 'next/image';

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export default function EditProductForm({ product, categories }: { product: Product; categories: Category[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [removingImage, setRemovingImage] = useState<string | null>(null);
  const [currentImages, setCurrentImages] = useState<string[]>(product.images ?? []);

  // New simple images
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Variant flags
  const [hasColors, setHasColors] = useState(product.has_colors ?? false);
  const [hasSizes, setHasSizes] = useState(product.has_sizes ?? false);

  // Existing variants (from DB)
  const [existingVariants, setExistingVariants] = useState<ProductVariant[]>(
    (product.variants ?? []).map((v) => ({
      ...v,
      images: v.images ?? (v as unknown as { variant_images?: VariantImage[] }).variant_images ?? [],
    })),
  );

  // New variants to add
  const [newColorVariants, setNewColorVariants] = useState<ColorVariantEntry[]>([]);

  // New images for existing variants: { variantId: File[] }
  const existingVariantFileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [existingVariantNewFiles, setExistingVariantNewFiles] = useState<Record<string, File[]>>({});
  const [existingVariantPreviews, setExistingVariantPreviews] = useState<Record<string, string[]>>({});

  // Sizes
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    (product.sizes ?? []).map((s) => s.size),
  );

  const flatCats = flattenTree(buildCategoryTree(categories));

  function handleFilesChange(files: FileList | null) {
    if (!files) return;
    const fileArr = Array.from(files);
    setNewFiles((prev) => [...prev, ...fileArr]);
    const newPreviews = fileArr.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  }

  function removeNewFile(idx: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => { URL.revokeObjectURL(prev[idx]); return prev.filter((_, i) => i !== idx); });
  }

  function toggleSize(size: string) {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  }

  async function handleRemoveCurrentImage(imgUrl: string) {
    setRemovingImage(imgUrl);
    try {
      await removeProductImage(product.id, imgUrl);
      setCurrentImages((prev) => prev.filter((u) => u !== imgUrl));
      toast.success('Image removed');
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setRemovingImage(null);
    }
  }

  async function handleDeleteVariant(variantId: string) {
    if (!confirm('Delete this color variant and all its images?')) return;
    try {
      await deleteVariant(variantId, product.id);
      setExistingVariants((prev) => prev.filter((v) => v.id !== variantId));
      toast.success('Color variant deleted');
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  }

  async function handleDeleteVariantImage(imageId: string, variantId: string) {
    try {
      await deleteVariantImage(imageId, product.id);
      setExistingVariants((prev) =>
        prev.map((v) =>
          v.id === variantId
            ? { ...v, images: (v.images ?? []).filter((img) => img.id !== imageId) }
            : v,
        ),
      );
      toast.success('Image removed');
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  }

  function handleExistingVariantFiles(variantId: string, files: File[]) {
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setExistingVariantNewFiles((prev) => ({
      ...prev,
      [variantId]: [...(prev[variantId] ?? []), ...files],
    }));
    setExistingVariantPreviews((prev) => ({
      ...prev,
      [variantId]: [...(prev[variantId] ?? []), ...newPreviews],
    }));
  }

  function removeExistingVariantNewFile(variantId: string, idx: number) {
    setExistingVariantNewFiles((prev) => ({
      ...prev,
      [variantId]: (prev[variantId] ?? []).filter((_, i) => i !== idx),
    }));
    setExistingVariantPreviews((prev) => {
      const p = [...(prev[variantId] ?? [])];
      URL.revokeObjectURL(p[idx]);
      return { ...prev, [variantId]: p.filter((_, i) => i !== idx) };
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.set('has_colors', hasColors ? 'true' : 'false');
      formData.set('has_sizes', hasSizes ? 'true' : 'false');

      if (!hasColors) {
        formData.delete('images');
        for (const file of newFiles) formData.append('images', file);
      } else {
        // New variants
        if (newColorVariants.length > 0) {
          const meta = newColorVariants.map((v, idx) => ({
            tempId: v.tempId,
            colorName: v.colorName,
            colorHex: v.colorHex,
            sortOrder: existingVariants.length + idx,
          }));
          formData.set('new_variants_json', JSON.stringify(meta));
          for (const v of newColorVariants) {
            for (const file of v.files) formData.append(`variant_img_${v.tempId}`, file);
          }
        }
        // New images for existing variants
        const existingVariantIds = existingVariants.map((v) => v.id);
        formData.set('existing_variant_ids', existingVariantIds.join(','));
        for (const vid of existingVariantIds) {
          for (const file of existingVariantNewFiles[vid] ?? []) {
            formData.append(`existing_variant_img_${vid}`, file);
          }
        }
      }

      if (hasSizes) {
        formData.set('sizes_json', JSON.stringify(selectedSizes));
      }

      await updateProduct(product.id, formData);
      toast.success('Product updated!');
      router.push('/dashboard/products');
      router.refresh();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Current simple images (when no colors) ───── */}
          {!hasColors && currentImages.length > 0 && (
            <div className="space-y-2">
              <Label>Current Images ({currentImages.length})</Label>
              <div className="flex flex-wrap gap-3">
                {currentImages.map((imgUrl, idx) => (
                  <div key={idx} className="relative group">
                    <img src={imgUrl} alt={`${product.name} ${idx + 1}`} className="h-28 w-28 rounded-lg object-cover border" />
                    <button
                      type="button"
                      disabled={removingImage === imgUrl}
                      onClick={() => handleRemoveCurrentImage(imgUrl)}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600 disabled:opacity-50"
                      title="Remove image"
                    >
                      <ImageOff className="h-3 w-3" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">Main</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New simple images to upload */}
          {!hasColors && previews.length > 0 && (
            <div className="space-y-2">
              <Label>New Images to Upload ({previews.length})</Label>
              <div className="flex flex-wrap gap-3">
                {previews.map((src, idx) => (
                  <div key={idx} className="relative group">
                    <img src={src} alt={`New ${idx + 1}`} className="h-28 w-28 rounded-lg object-cover border border-blue-300" />
                    <button
                      type="button"
                      onClick={() => removeNewFile(idx)}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                      title="Remove"
                    >
                      <ImageOff className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Basic fields */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Name *</Label>
              <Input name="name" required defaultValue={product.name} />
            </div>
            <div className="space-y-1">
              <Label>Slug *</Label>
              <Input name="slug" required defaultValue={product.slug} />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea name="description" rows={4} defaultValue={product.description ?? ''} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>Price (PKR) *</Label>
              <Input name="price" type="number" min="0" required defaultValue={product.price} />
            </div>
            <div className="space-y-1">
              <Label>Discount Price</Label>
              <Input name="discount_price" type="number" min="0" defaultValue={product.discount_price ?? ''} />
            </div>
            <div className="space-y-1">
              <Label>Stock *</Label>
              <Input name="stock" type="number" min="0" required defaultValue={product.stock} />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Category *</Label>
            <select
              name="category_id"
              aria-label="Category"
              required
              defaultValue={product.category_id ?? ''}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Select category…</option>
              {flatCats.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {'  '.repeat(cat.level)}{cat.level > 0 ? '└ ' : ''}{cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label>Shipping Category *</Label>
            <select
              name="shipping_category"
              aria-label="Shipping Category"
              defaultValue={product.shipping_category ?? 'small_parcel'}
              required
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {SHIPPING_CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label} — {o.hint}</option>
              ))}
            </select>
          </div>

          {/* ── Variant Feature Flags ─────────────────────── */}
          <div className="rounded-xl border border-gray-200 p-4 bg-gray-50 space-y-3">
            <p className="text-sm font-semibold text-gray-700">Product Options</p>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasColors}
                onChange={(e) => setHasColors(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 accent-blue-600"
              />
              <span className="text-sm text-gray-800">This product has colors</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasSizes}
                onChange={(e) => setHasSizes(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 accent-blue-600"
              />
              <span className="text-sm text-gray-800">This product has sizes</span>
            </label>
          </div>

          {/* ── Images or Color Variants ─────────────────── */}
          {!hasColors ? (
            <div className="space-y-1">
              <Label>Add Images</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                title="Upload product images"
                onChange={(e) => handleFilesChange(e.target.files)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors w-full justify-center"
              >
                <Plus className="h-4 w-4" />
                Add More Images
              </button>
              <p className="text-xs text-gray-400">First image is the main thumbnail.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Label>Color Variants</Label>

              {/* Existing variants */}
              {existingVariants.length > 0 && (
                <style>{existingVariants.filter(v => v.color_hex).map(v => {
                  const cls = 'c' + v.color_hex!.replace(/[^a-z0-9]/gi, '');
                  const safeHex = /^#[0-9a-fA-F]{3,8}$/.test(v.color_hex!) ? v.color_hex : 'transparent';
                  return `.${cls}{background-color:${safeHex}}`;
                }).join('')}</style>
              )}
              {existingVariants.map((v, vi) => (
                <div key={v.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`c${(v.color_hex ?? '').replace(/[^a-z0-9]/gi, '')} h-5 w-5 rounded-full border border-gray-300 inline-block flex-shrink-0`}
                      />
                      <span className="font-medium text-sm text-gray-700">{v.color_name}</span>
                      <span className="text-xs text-gray-400 font-mono">{v.color_hex}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteVariant(v.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Delete variant"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Existing images */}
                  <div className="flex flex-wrap gap-2">
                    {(v.images ?? []).map((img) => (
                      <div key={img.id} className="relative group h-20 w-20 rounded-lg overflow-hidden border border-gray-200">
                        <Image
                          src={img.image_url}
                          alt={v.color_name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteVariantImage(img.id, v.id)}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove image"
                        >
                          <ImageOff className="h-3 w-3" />
                        </button>
                      </div>
                    ))}

                    {/* New file previews for this existing variant */}
                    {(existingVariantPreviews[v.id] ?? []).map((src, idx) => (
                      <div key={`new-${idx}`} className="relative group h-20 w-20 rounded-lg overflow-hidden border-2 border-blue-300">
                        <Image src={src} alt="new" fill className="object-cover" unoptimized />
                        <button
                          type="button"
                          onClick={() => removeExistingVariantNewFile(v.id, idx)}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove image"
                          aria-label="Remove image"
                        >
                          <ImageOff className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add images to this variant */}
                  <button
                    type="button"
                    onClick={() => existingVariantFileRefs.current[v.id]?.click()}
                    className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
                  >
                    <Upload className="h-3 w-3" />
                    Add images for {v.color_name}
                  </button>
                  <input
                    ref={(el) => { existingVariantFileRefs.current[v.id] = el; }}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    aria-label={`Add images for ${v.color_name}`}
                    title={`Add images for ${v.color_name}`}
                    onChange={(e) => {
                      const files = Array.from(e.target.files ?? []);
                      if (files.length) handleExistingVariantFiles(v.id, files);
                      e.target.value = '';
                    }}
                  />
                </div>
              ))}

              {/* New variants to add */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Add New Color Variants</p>
                <ColorVariantUploader variants={newColorVariants} onChange={setNewColorVariants} />
              </div>
            </div>
          )}

          {/* ── Sizes ────────────────────────────────────── */}
          {hasSizes && (
            <div className="space-y-2">
              <Label>Available Sizes</Label>
              <div className="flex flex-wrap gap-2">
                {ALL_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      selectedSizes.includes(size)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_active" value="true" defaultChecked={product.is_active} />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_featured" value="true" defaultChecked={product.is_featured} />
              Featured
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={loading}>Save Changes</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
