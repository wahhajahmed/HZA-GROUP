import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, MapPin, Truck, CheckCircle, Clock, XCircle, RefreshCw, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getOrderById } from '@/services/order.service'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Order Details`,
    description: `View details for order ${id}`,
  }
}

const STATUS_ICONS = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: RefreshCw,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
  refunded: RefreshCw,
}

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?redirect=/orders/${id}`)
  }

  const result = await getOrderById(id)

  if (result.error || !result.data) {
    notFound()
  }

  const order = result.data
  const isCancelled = order.status === 'cancelled' || order.status === 'refunded'
  const currentStepIndex = STATUS_STEPS.indexOf(order.status)
  const progressWidthClass =
    currentStepIndex <= 0 ? 'w-0' :
    currentStepIndex === 1 ? 'w-1/4' :
    currentStepIndex === 2 ? 'w-1/2' :
    currentStepIndex === 3 ? 'w-3/4' : 'w-full'
  const StatusIcon = STATUS_ICONS[order.status as keyof typeof STATUS_ICONS] || Clock
  const orderItems = (order.order_items as Array<{
    id: string
    product_id: string
    product_name: string
    product_image: string
    quantity: number
    price: number
    product?: { name: string; images: string[] }
  }>) || []

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/orders"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{order.order_number}</h1>
            <p className="text-muted-foreground mt-1">
              Placed on {formatDateTime(order.created_at)}
            </p>
          </div>
          <Badge
            className="text-sm px-3 py-1"
            variant={
              (ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS] as 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline') || 'secondary'
            }
          >
            <StatusIcon className="h-4 w-4 mr-1.5" />
            {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] || order.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Progress Tracker */}
          {!isCancelled && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Order Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200" />
                  <div
                    className={`absolute top-5 left-5 h-0.5 bg-primary transition-all duration-500 ${progressWidthClass}`}
                  />
                  {/* Steps */}
                  <div className="relative flex justify-between">
                    {STATUS_STEPS.map((step, index) => {
                      const isCompleted = index <= currentStepIndex
                      const isCurrent = index === currentStepIndex
                      return (
                        <div key={step} className="flex flex-col items-center gap-2">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors z-10 bg-white ${
                              isCompleted
                                ? 'border-primary bg-primary text-white'
                                : 'border-gray-300 text-gray-400'
                            } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                          >
                            {isCompleted ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <span className="text-xs font-medium">{index + 1}</span>
                            )}
                          </div>
                          <span
                            className={`text-xs font-medium capitalize text-center ${
                              isCompleted ? 'text-primary' : 'text-muted-foreground'
                            }`}
                          >
                            {ORDER_STATUS_LABELS[step as keyof typeof ORDER_STATUS_LABELS] || step}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {order.tracking_number && (
                  <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Tracking Number:{' '}
                        <span className="font-bold">{order.tracking_number}</span>
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items Ordered ({orderItems.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex gap-4 py-2">
                    <div className="h-16 w-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      {(item.product?.images?.[0] || item.product_image) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.product?.images?.[0] || item.product_image || ''}
                          alt={item.product?.name || item.product_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-clamp-1">
                        {item.product?.name || 'Product'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.price)} each × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Shipping Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Recipient</p>
                  <p className="font-medium">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{order.customer_phone}</p>
                </div>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">Address</p>
                <p className="font-medium">{order.address}</p>
                <p className="font-medium">{order.city}</p>
              </div>
              {order.notes && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Order Notes</p>
                  <p className="italic">{order.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Total</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span>
                  {order.delivery_charge === 0 ? (
                    <span className="text-green-600 font-medium">Free</span>
                  ) : (
                    formatCurrency(order.delivery_charge)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold border-t pt-3">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(order.total)}</span>
              </div>
              <div className="pt-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                  </svg>
                  Cash on Delivery
                </div>
              </div>
            </CardContent>
          </Card>

          <Button asChild variant="outline" className="w-full">
            <Link href="/orders">View All Orders</Link>
          </Button>
          <Button asChild className="w-full">
            <Link href="/">Continue Shopping</Link>
          </Button>

          {/* Write Review button for delivered & unreviewed orders */}
          {order.status === 'delivered' && !order.reviewed && (
            <Button asChild variant="outline" className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-50">
              <Link href={`/review?token=${order.id}`}>
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 mr-2" />
                Write a Review
              </Link>
            </Button>
          )}
          {order.reviewed && (
            <p className="text-center text-sm text-green-600 flex items-center justify-center gap-1">
              <CheckCircle className="h-4 w-4" /> Review submitted
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
