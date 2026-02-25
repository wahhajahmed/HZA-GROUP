import Link from 'next/link';
import { getAllOrders } from '@/services/order.service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ORDER_STATUS_LABELS } from '@/lib/constants';
import { Eye } from 'lucide-react';

export const dynamic = 'force-dynamic';

const statusVariant: Record<string, any> = {
  pending: 'warning',
  processing: 'default',
  shipped: 'default',
  delivered: 'success',
  cancelled: 'destructive',
  refunded: 'secondary',
};

export default async function OrdersPage() {
  const orders = await getAllOrders();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold sm:text-2xl">Orders ({orders.length})</h1>

      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Order</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Amount</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order: any) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-500">#{order.id.slice(0, 8)}</td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">{order.customer_name ?? '—'}</p>
                    <p className="text-xs text-gray-400">{order.customer_email ?? '—'}</p>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium">{formatCurrency((order as any).total)}</td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant[order.status] ?? 'secondary'}>
                    {ORDER_STATUS_LABELS[order.status] ?? order.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(order.created_at)}</td>
                <td className="px-4 py-3">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/orders/${order.id}`}><Eye className="h-3 w-3" /></Link>
                  </Button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
