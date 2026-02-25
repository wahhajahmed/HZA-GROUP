import { redirect } from 'next/navigation'
import { User, Mail, Shield, Calendar, Package, Settings, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUserOrders } from '@/services/order.service'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Account',
  description: 'Manage your account settings and view order history.',
}

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/account')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch recent orders
  const ordersResult = await getUserOrders(5)
  const recentOrders = !ordersResult.error ? ordersResult.data || [] : []

  return (
    <div className="container max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">My Account</h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile and view your order history
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile Card */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  {profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || 'User'}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-primary/50" />
                  )}
                </div>

                <h2 className="font-bold text-xl">
                  {profile?.full_name || user.user_metadata?.full_name || 'User'}
                </h2>
                <p className="text-muted-foreground text-sm mt-1">{user.email}</p>

                {profile?.is_admin && (
                  <Badge variant="secondary" className="mt-2">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}

                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
                  <Calendar className="h-3 w-3" />
                  Member since {formatDate(user.created_at)}
                </div>
              </div>

              <div className="mt-6 space-y-3 border-t pt-4">
                <div className="flex items-start gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-muted-foreground text-xs">Email</p>
                    <p className="font-medium break-all">{user.email}</p>
                  </div>
                </div>
                {profile?.phone && (
                  <div className="flex items-start gap-3 text-sm">
                    <svg className="h-4 w-4 text-muted-foreground mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <p className="text-muted-foreground text-xs">Phone</p>
                      <p className="font-medium">{profile.phone}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2">
                {profile?.is_admin && (
                  <Button asChild variant="secondary" className="w-full" size="sm">
                    <Link href="/admin">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Panel
                    </Link>
                  </Button>
                )}
                <Button asChild variant="outline" className="w-full" size="sm">
                  <Link href="/orders">
                    <Package className="h-4 w-4 mr-2" />
                    View All Orders
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full" size="sm">
                  <Link href="/queries">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    My Queries
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Stats */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Quick Stats
              </h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-primary/5 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{recentOrders.length}</p>
                  <p className="text-xs text-muted-foreground">Orders</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {recentOrders.filter((o) => o.status === 'delivered').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Delivered</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/orders">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-10">
                  <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No orders yet</p>
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <Link href="/">Start Shopping</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/orders/${order.id}`}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{order.order_number}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(order.created_at)} ·{' '}
                            {(order.order_items as Array<{quantity: number}>)?.reduce(
                              (sum: number, i) => sum + i.quantity,
                              0
                            ) || 0}{' '}
                            item(s)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-semibold text-sm">{formatCurrency(order.total)}</p>
                          <Badge
                            variant={
                              (ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS] as 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline') || 'secondary'
                            }
                            className="text-xs"
                          >
                            {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] || order.status}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
