import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Package, ChevronRight, ShoppingBag } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserOrders } from '@/services/order.service'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Orders',
  description: 'View your order history and tracking information.',
}

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/orders')
  }

  const result = await getUserOrders()
  const orders = !result.error ? result.data || [] : []

  if (orders.length === 0) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">My Orders</h1>
          <p className="text-muted-foreground mt-1">Track and manage your orders</p>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <ShoppingBag className="h-12 w-12 text-primary/50" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            You haven&apos;t placed any orders yet. Start shopping and your orders will appear here.
          </p>
          <Button asChild size="lg">
            <Link href="/">Start Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">My Orders</h1>
        <p className="text-muted-foreground mt-1">
          {orders.length} order{orders.length !== 1 ? 's' : ''} placed
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <Link href={`/orders/${order.id}`} className="block p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Order Icon */}
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary" />
                  </div>

                  {/* Order Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-sm md:text-base">
                        {order.order_number}
                      </span>
                      <Badge
                        variant={
                          (ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS] as 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline') || 'secondary'
                        }
                      >
                        {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] || order.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span>Placed {formatDate(order.created_at)}</span>
                      <span>
                        {(order.order_items as Array<{quantity: number}>)?.reduce((sum: number, i) => sum + i.quantity, 0) || 0} item(s)
                      </span>
                      {order.tracking_number && (
                        <span>Tracking: {order.tracking_number}</span>
                      )}
                    </div>
                  </div>

                  {/* Total & Arrow */}
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <p className="font-bold text-lg text-primary">
                        {formatCurrency(order.total)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        incl. {formatCurrency(order.delivery_charge)} delivery
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
