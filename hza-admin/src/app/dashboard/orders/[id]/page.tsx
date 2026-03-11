import { notFound } from 'next/navigation';
import { getOrderById } from '@/services/order.service';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { ORDER_STATUS_LABELS, ORDER_STATUS_OPTIONS } from '@/lib/constants';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import OrderStatusForm from './OrderStatusForm';

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id) as any;
  if (!order) notFound();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/orders"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold">Order #{order.id.slice(0, 8)}</h1>
        <Badge variant="secondary">{ORDER_STATUS_LABELS[order.status] ?? order.status}</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Customer */}
        <Card>
          <CardHeader><CardTitle className="text-base">Customer</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{order.customer_name}</p>
            <p className="text-gray-500">{order.customer_email}</p>
            <p className="text-gray-500">{order.customer_phone}</p>
          </CardContent>
        </Card>

        {/* Shipping */}
        <Card>
          <CardHeader><CardTitle className="text-base">Shipping Address</CardTitle></CardHeader>
          <CardContent className="text-sm text-gray-600">
            <p>{order.address}</p>
            <p>{order.city}</p>
            {order.tracking_number && (
              <p className="mt-2 font-medium">Tracking: {order.tracking_number}</p>
            )}
          </CardContent>
        </Card>
      </div>

          {/* Items */}
      <Card>
        <CardHeader><CardTitle className="text-base">Items ({order.order_items?.length ?? 0})</CardTitle></CardHeader>
        <CardContent>
          <div className="divide-y">
            {(order.order_items ?? []).map((item: any) => (
              <div key={item.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  {item.product_image && (
                    <img src={item.product_image} alt={item.product_name} className="h-12 w-12 rounded-lg object-cover" />
                  )}
                  <div className="space-y-1">
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    {/* Color / Size badges */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {item.selected_color && (() => {
                        const hex = (item.product?.variants ?? []).find(
                          (v: any) => v.color_name === item.selected_color,
                        )?.color_hex;
                        const cls = hex && /^#[0-9a-fA-F]{3,8}$/.test(hex)
                          ? 'c' + hex.replace(/[^a-z0-9]/gi, '') : null;
                        return (
                          <>
                            {cls && <style>{`.${cls}{background-color:${hex}}`}</style>}
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white border border-gray-200">
                              {cls && <span className={`${cls} h-3 w-3 rounded-full border border-gray-300 inline-block`} />}
                              {item.selected_color}
                            </span>
                          </>
                        );
                      })()}
                      {item.selected_size && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          Size: {item.selected_size}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(order.subtotal ?? 0)}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span>{formatCurrency(order.delivery_charge ?? 0)}</span></div>
            <div className="flex justify-between font-bold text-base"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Status + Tracking Form */}
      <OrderStatusForm orderId={order.id} currentStatus={order.status} trackingNumber={order.tracking_number ?? ''} />

      <p className="text-xs text-gray-400">Placed: {formatDateTime(order.created_at)}</p>
    </div>
  );
}
