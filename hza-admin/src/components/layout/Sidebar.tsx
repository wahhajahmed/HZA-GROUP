'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  LayoutDashboard, Package, Tag, ShoppingCart,
  Users, Truck, MessageSquare, Star, Megaphone, LogOut, Store, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { STORE_URL } from '@/lib/constants';
import { BrandLogo } from '@/components/shared/BrandLogo';

function BadgeCount({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white leading-none">
      {count > 99 ? '99+' : count}
    </span>
  );
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingOrders, setPendingOrders] = useState(0);
  const [openQueries, setOpenQueries] = useState(0);

  useEffect(() => {
    const supabase = createClient();

    async function fetchCounts() {
      const [ordersRes, queriesRes] = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact', head: true }).not('status', 'in', '(delivered,cancelled)'),
        supabase.from('support_queries').select('id', { count: 'exact', head: true }).eq('is_read', false),
      ]);
      setPendingOrders(ordersRes.count ?? 0);
      setOpenQueries(queriesRes.count ?? 0);
    }

    fetchCounts();

    const ordersSub = supabase
      .channel('sidebar-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchCounts)
      .subscribe();

    const queriesSub = supabase
      .channel('sidebar-queries')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_queries' }, fetchCounts)
      .subscribe();

    return () => {
      supabase.removeChannel(ordersSub);
      supabase.removeChannel(queriesSub);
    };
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    onClose?.();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success('Signed out');
    router.push('/login');
    router.refresh();
  }

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, count: 0 },
    { label: 'Products', href: '/dashboard/products', icon: Package, count: 0 },
    { label: 'Categories', href: '/dashboard/categories', icon: Tag, count: 0 },
    { label: 'Orders', href: '/dashboard/orders', icon: ShoppingCart, count: pendingOrders },
    { label: 'Customers', href: '/dashboard/customers', icon: Users, count: 0 },
    { label: 'Delivery', href: '/dashboard/delivery', icon: Truck, count: 0 },
    { label: 'Queries', href: '/dashboard/queries', icon: MessageSquare, count: openQueries },
    { label: 'Reviews', href: '/dashboard/reviews', icon: Star, count: 0 },
    { label: 'Promotions', href: '/dashboard/promotions', icon: Megaphone, count: 0 },
  ];

  return (
    <>
      {/* Backdrop (Mobile only) */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:relative lg:translate-x-0 shrink-0',
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        )}
      >
        <aside className="flex h-full w-64 flex-col bg-slate-900 border-r border-slate-800">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 px-5 border-b border-slate-800 bg-slate-950/20">
            <div className="flex items-center w-full">
              <BrandLogo asLink={true} href="/dashboard" variant="dark" size="md" />
              <button
                onClick={onClose}
                aria-label="Close sidebar"
                className="ml-auto text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 lg:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6 custom-scrollbar">
            {navItems.map(({ label, href, icon: Icon, count }) => {
              const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group relative',
                    active 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110", active ? "text-white" : "text-slate-500")} />
                  <span className="flex-1">{label}</span>
                  <BadgeCount count={count} />
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="mt-auto border-t border-slate-800 p-4 space-y-2 bg-slate-950/20">
            <a
              href={STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all ring-1 ring-slate-800"
            >
              <Store className="h-4 w-4" />
              View Store
            </a>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}
