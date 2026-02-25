import Link from 'next/link';
import { getProducts } from '@/services/product.service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Plus, Pencil } from 'lucide-react';
import DeleteProductButton from './DeleteProductButton';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Products ({products.length})</h1>
        <Button asChild>
          <Link href="/dashboard/products/new"><Plus className="h-4 w-4" /> Add Product</Link>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Stock</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.images?.[0] && (
                      <img src={p.images[0]} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                    )}
                    <span className="font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{(p as any).categories?.name ?? '—'}</td>
                <td className="px-4 py-3">
                  {p.discount_price ? (
                    <div>
                      <span className="font-medium text-green-600">{formatCurrency(p.discount_price)}</span>
                      <span className="ml-1 text-xs line-through text-gray-400">{formatCurrency(p.price)}</span>
                    </div>
                  ) : (
                    <span>{formatCurrency(p.price)}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={p.stock === 0 ? 'destructive' : p.stock < 5 ? 'warning' : 'success'}>
                    {p.stock}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={p.is_active ? 'success' : 'secondary'}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/products/${p.id}`}><Pencil className="h-3 w-3" /></Link>
                    </Button>
                    <DeleteProductButton id={p.id} name={p.name} />
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No products yet. Add your first product.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
