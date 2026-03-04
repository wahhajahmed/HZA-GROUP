'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createProduct } from '@/services/product.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { slugify } from '@/lib/utils';
import { SHIPPING_CATEGORY_OPTIONS } from '@/lib/dc-calculator';
import { buildCategoryTree, flattenTree } from '@/lib/category-tree';
import { Plus, ImageOff } from 'lucide-react';
import type { Category } from '@/types';

export default function NewProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFilesChange(fileList: FileList | null) {
    if (!fileList) return;
    const newFiles = Array.from(fileList);
    setFiles((prev) => [...prev, ...newFiles]);
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => { URL.revokeObjectURL(prev[idx]); return prev.filter((_, i) => i !== idx); });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      // Remove default file input entries, add our managed files
      formData.delete('images');
      for (const file of files) {
        formData.append('images', file);
      }
      await createProduct(formData);
      toast.success('Product created!');
      router.push('/dashboard/products');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  const flatCats = flattenTree(buildCategoryTree(categories));

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Name *</Label>
              <Input name="name" required value={name} onChange={(e) => { setName(e.target.value); setSlug(slugify(e.target.value)); }} />
            </div>
            <div className="space-y-1">
              <Label>Slug *</Label>
              <Input name="slug" required value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea name="description" rows={4} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>Price (PKR) *</Label>
              <Input name="price" type="number" min="0" required />
            </div>
            <div className="space-y-1">
              <Label>Discount Price</Label>
              <Input name="discount_price" type="number" min="0" />
            </div>
            <div className="space-y-1">
              <Label>Stock *</Label>
              <Input name="stock" type="number" min="0" defaultValue="0" required />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Category *</Label>
            <select
              name="category_id"
              aria-label="Category"
              required
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
              defaultValue="small_parcel"
              required
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {SHIPPING_CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label} — {o.hint}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400">
              This determines the delivery charge tier. Locked for customers.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Product Images</Label>
            {previews.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {previews.map((src, idx) => (
                  <div key={idx} className="relative group">
                    <img src={src} alt={`Preview ${idx + 1}`} className="h-28 w-28 rounded-lg object-cover border" />
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                      title="Remove"
                    >
                      <ImageOff className="h-3 w-3" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">Main</span>
                    )}
                  </div>
                ))}
              </div>
            )}
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
              {files.length > 0 ? 'Add More Images' : 'Select Images'}
            </button>
            <p className="text-xs text-gray-400">Upload multiple images. First image will be the main thumbnail.</p>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_active" value="true" defaultChecked />
              Active (visible in store)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_featured" value="true" />
              Featured
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={loading}>Create Product</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
