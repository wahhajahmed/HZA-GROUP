import { getDashboardStats } from '@/services/order.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { ShoppingCart, Users, DollarSign, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const statCards = [
    { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'text-blue-600 bg-blue-50' },
    { title: 'Pending Orders', value: stats.pendingOrders, icon: ShoppingCart, color: 'text-yellow-600 bg-yellow-50' },
    { title: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'text-green-600 bg-green-50' },
    { title: 'Monthly Revenue', value: formatCurrency(stats.monthlyRevenue), icon: DollarSign, color: 'text-purple-600 bg-purple-50' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ title, value, icon: Icon, color }) => (
          <Card key={title}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`rounded-xl p-3 ${color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Low Stock */}
      {stats.lowStockProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert ({stats.lowStockProducts.length} products)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.lowStockProducts.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border px-4 py-2">
                  <span className="text-sm font-medium">{p.name}</span>
                  <Badge variant={p.stock === 0 ? 'destructive' : 'warning'}>
                    {p.stock === 0 ? 'Out of Stock' : `${p.stock} left`}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
