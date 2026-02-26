import { getDashboardStats } from '@/services/order.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { ShoppingCart, Users, DollarSign, AlertTriangle, TrendingUp, Package } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const statCards = [
    { 
      title: 'Monthly Revenue', 
      value: formatCurrency(stats.monthlyRevenue), 
      icon: DollarSign, 
      color: 'from-emerald-500 to-teal-600',
      description: 'Total revenue this month'
    },
    { 
      title: 'Total Orders', 
      value: stats.totalOrders, 
      icon: ShoppingCart, 
      color: 'from-indigo-500 to-blue-600',
      description: 'Cumulative order count'
    },
    { 
      title: 'Pending Orders', 
      value: stats.pendingOrders, 
      icon: Package, 
      color: 'from-amber-400 to-orange-500',
      description: 'Orders awaiting attention'
    },
    { 
      title: 'Total Customers', 
      value: stats.totalCustomers, 
      icon: Users, 
      color: 'from-violet-500 to-purple-600',
      description: 'Registered user base'
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto px-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
           Overview <span className="reveal-text">Performance</span>
        </h1>
        <p className="text-slate-500 max-w-2xl">
          Track your store's performance with real-time data insights and critical alerts.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ title, value, icon: Icon, color, description }) => (
          <div key={title} className="premium-card p-0 group overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg shadow-indigo-200/50 transition-transform group-hover:scale-110 duration-500`}>
                  <Icon className="h-6 w-6" />
                </div>
                {title === 'Monthly Revenue' && (
                  <div className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</p>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
                <p className="text-[10px] text-slate-400 font-medium">{description}</p>
              </div>
            </CardContent>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Low Stock Alert */}
        <div className="md:col-span-2">
          {stats.lowStockProducts.length > 0 ? (
            <div className="premium-card overflow-hidden">
              <div className="border-b border-slate-50 bg-slate-50/50 p-4 flex items-center justify-between">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2">
                   <AlertTriangle className="h-4 w-4 text-amber-500" />
                   Critical Inventory Status
                 </h3>
                 <Badge variant="outline" className="bg-white border-slate-200 text-slate-600">
                   {stats.lowStockProducts.length} Issues Found
                 </Badge>
              </div>
              <div className="p-4 space-y-3">
                {stats.lowStockProducts.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="flex flex-col">
                       <span className="text-sm font-bold text-slate-800 uppercase tracking-tight">{p.name}</span>
                       <span className="text-[10px] text-slate-400">ID: {p.id.substring(0, 8)}...</span>
                    </div>
                    <Badge className={`${p.stock === 0 ? 'bg-red-500' : 'bg-amber-500'} text-white border-0 px-3 py-1 font-bold`}>
                      {p.stock === 0 ? 'RESTOCK NOW' : `${p.stock} UNITS REMAINING`}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="premium-card p-12 flex flex-col items-center justify-center text-center space-y-4">
               <div className="p-4 rounded-full bg-emerald-50 text-emerald-500">
                  <Package className="h-8 w-8" />
               </div>
               <div>
                 <h3 className="font-bold text-slate-800">Inventory Healthy</h3>
                 <p className="text-sm text-slate-500">All products have sufficient stock levels.</p>
               </div>
            </div>
          )}
        </div>

        {/* Action Card */}
        <div className="premium-card p-6 bg-indigo-900 text-white border-0 shadow-indigo-200 flex flex-col justify-between">
           <div className="space-y-2">
             <h3 className="text-xl font-bold">Quick Report</h3>
             <p className="text-indigo-200 text-sm">Download your current performance summary as a PDF.</p>
           </div>
           <button className="w-full bg-white text-indigo-900 font-bold py-3 rounded-xl hover:bg-indigo-50 transition-all hover:scale-[1.02]">
             Export Summary
           </button>
        </div>
      </div>
    </div>
  );
}
