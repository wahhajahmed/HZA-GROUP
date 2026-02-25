'use client';

import Link from 'next/link';
import Image from 'next/image';
import logoStyles from '@/components/shared/LogoImg.module.css';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, Menu, X, User, LogOut, Package } from 'lucide-react';
import { useState, useSyncExternalStore } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { createClient } from '@/lib/supabase/client';
import { NAV_LINKS } from '@/lib/constants';
import { cn } from '@/lib/utils';
// Removed HzaGroupLogo import

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  // useSyncExternalStore ensures server snapshot = 0, preventing hydration mismatch
  const totalItems = useSyncExternalStore(
    useCartStore.subscribe,
    () => useCartStore.getState().totalItems(),
    () => 0
  );
  const { setItems } = useCartStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleCartClick = () => {
    if (!user) {
      toast.error('Please login to view your cart');
      router.push('/login?next=/cart');
      return;
    }
    router.push('/cart');
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setItems([]);
    setUserMenuOpen(false);
    toast.success('Logged out successfully');
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center" style={{ minHeight: 0 }}>
          <Image
            src="/images/hza-logo.jpeg"
            alt="HZA Group Logo"
            height={60}
            width={180}
            className={logoStyles.logoImg}
            priority
            style={{ maxHeight: 65, width: 'auto', objectFit: 'contain', background: 'none', display: 'block' }}
            sizes="(max-width: 768px) 120px, (max-width: 1200px) 160px, 180px"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-blue-600',
                pathname === link.href
                  ? 'text-blue-600'
                  : 'text-gray-600'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <button
            onClick={handleCartClick}
            className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>

          {/* User menu — desktop */}
          {user ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="max-w-[120px] truncate font-semibold">{user.full_name}</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-gray-200 bg-white p-1 shadow-lg z-50">
                  <Link
                    href="/account"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <User className="h-4 w-4" />
                    My Account
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Package className="h-4 w-4" />
                    My Orders
                  </Link>
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => router.push('/login')}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => router.push('/signup')}
                className="rounded-lg px-3 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="p-2 text-gray-600 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pb-4 animate-fade-in">
          <nav className="flex flex-col gap-1 pt-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-gray-100" />
            {user ? (
              <>
                <div className="px-3 py-2 text-sm font-semibold text-blue-600 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {user.full_name}
                </div>
                <hr className="my-1 border-gray-100" />
                <Link
                  href="/account"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User className="h-4 w-4" />
                  My Account
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Package className="h-4 w-4" />
                  My Orders
                </Link>
                <button
                  onClick={() => { setMenuOpen(false); handleSignOut(); }}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setMenuOpen(false); router.push('/login'); }}
                  className="flex-1 text-center rounded-lg px-3 py-2 text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => { setMenuOpen(false); router.push('/signup'); }}
                  className="flex-1 text-center rounded-lg px-3 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
