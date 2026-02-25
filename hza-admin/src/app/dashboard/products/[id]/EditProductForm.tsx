'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { updateProduct } from '@/services/product.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { SHIPPING_CATEGORY_OPTIONS } from '@/lib/dc-calculator';
import { buildCategoryTree, flattenTree } from '@/lib/category-tree';
import type { Product, Category } from '@/types';

export default function EditProductForm({ product, categories }: { product: Product; categories: Category[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const flatCats = flattenTree(buildCategoryTree(categories));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await updateProduct(product.id, formData);
      toast.success('Product updated!');
      router.push('/dashboard/products');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {product.images?.[0] && (
            <img src={product.images[0]} alt={product.name} className="h-32 w-32 rounded-lg object-cover" />
          )}

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
            <p className="text-xs text-gray-400">
              Determines delivery charge tier. Locked for customers.
            </p>
          </div>

          <div className="space-y-1">
            <Label>Replace Image</Label>
            <Input name="image" type="file" accept="image/*" />
          </div>

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
