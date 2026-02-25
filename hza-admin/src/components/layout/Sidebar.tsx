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

  const sidebarContent = (
    <aside className="flex h-full w-64 flex-col bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5 border-b border-gray-800">
        <div className="flex items-center w-full">
          <BrandLogo asLink={true} href="/dashboard" variant="dark" size="md" />
          {onClose && (
            <button onClick={onClose} aria-label="Close sidebar" className="ml-auto text-gray-400 hover:text-white lg:hidden">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map(({ label, href, icon: Icon, count }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{label}</span>
              <BadgeCount count={count} />
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-800 p-3 space-y-1">
        <a
          href={process.env.NEXT_PUBLIC_STORE_URL ?? 'http://localhost:3000'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <Store className="h-4 w-4" />
          View Store
        </a>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400 hover:bg-red-900/40 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return sidebarContent;
}
