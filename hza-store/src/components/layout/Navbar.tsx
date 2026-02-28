'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, Menu, X, User, LogOut, Package, ChevronDown, ArrowUpRight } from 'lucide-react';
import { useState, useSyncExternalStore, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { createClient } from '@/lib/supabase/client';
import { NAV_LINKS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalItems = useSyncExternalStore(
    useCartStore.subscribe,
    () => useCartStore.getState().totalItems(),
    () => 0
  );
  
  const { setItems } = useCartStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  // Keyboard navigation for user menu
  useEffect(() => {
    if (!userMenuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setUserMenuOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [userMenuOpen]);

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
    <header className={cn(
      "fixed top-0 z-50 w-full transition-all duration-300 px-4 pt-4",
      scrolled ? "pt-2" : "pt-4"
    )}>
      <div className={cn(
        "container mx-auto flex h-16 max-w-7xl items-center justify-between px-6 rounded-2xl transition-all duration-300",
        scrolled ? "glass shadow-xl h-14" : "bg-white border border-slate-100 shadow-premium"
      )}>
        {/* Logo */}
        <Link href="/" className="flex items-center group transition-transform hover:scale-105">
           <div className="relative h-10 w-28 md:w-32">
             <Image
                src="/images/hza-logo.jpeg"
                alt="HZA Group"
                fill
                className="object-contain"
                priority
                sizes="120px"
              />
           </div>
        </Link>

        {/* Center Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-4 py-2 rounded-lg text-xs font-black uppercase tracking-[0.15em] transition-all duration-300',
                pathname === link.href
                  ? 'text-primary bg-indigo-50/50'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Cart with Premium Badge */}
          <button
            onClick={handleCartClick}
            aria-label="View cart"
            className="group relative h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-primary hover:text-white transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ShoppingCart className="h-5 w-5 transition-transform group-hover:scale-110" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 border-2 border-white text-[9px] font-black text-white shadow-lg">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>

          {/* User Section */}
          <div className="h-6 w-[1px] bg-slate-100 hidden md:block mx-1" />

          {user ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={userMenuOpen ? 'true' : 'false'}
                aria-label="User menu"
                className="flex items-center gap-2 group p-1 pr-2 rounded-xl transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') setUserMenuOpen(v => !v);
                }}
              >
                <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center text-primary">
                   <User className="h-4 w-4" />
                </div>
                <div className="flex flex-col items-start leading-none">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">HZA Member</span>
                   <span className="text-sm font-black text-slate-900 truncate max-w-[100px]">{user.full_name.split(' ')[0]}</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", userMenuOpen && "rotate-180")} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-[120%] w-56 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl animate-fade-in ring-1 ring-slate-950/5" role="menu" aria-label="User menu">
                  <div className="px-3 py-3 border-b border-slate-50 mb-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account Settings</p>
                  </div>
                  <Link
                    href="/account"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    role="menuitem"
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    My Profile
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    role="menuitem"
                  >
                    <Package className="h-4 w-4 text-slate-400" />
                    Manage Orders
                  </Link>
                  <div className="my-1 h-[1px] bg-slate-50" />
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                    role="menuitem"
                  >
                    <LogOut className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-600 hover:text-slate-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="btn-primary py-2 px-5 text-xs font-black tracking-widest leading-none"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="p-2 text-slate-600 lg:hidden border-l border-slate-100 ml-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Toggle mobile menu"
            aria-expanded={menuOpen ? 'true' : 'false'}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overhaul */}
      {menuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 px-4 pt-2 animate-fade-in" role="dialog" aria-modal="true" aria-label="Mobile menu">
          <div className="glass rounded-3xl p-6 shadow-2xl">
            <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 px-2">Navigation</p>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-black tracking-tight transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    pathname === link.href
                      ? 'bg-primary text-white shadow-lg shadow-indigo-200'
                      : 'text-slate-700 hover:bg-slate-50'
                  )}
                  tabIndex={0}
                >
                  {link.label}
                  <ArrowUpRight className="h-4 w-4 opacity-30" />
                </Link>
              ))}
              <div className="my-4 h-[1px] bg-slate-100/50" />
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center font-black">
                       {user.full_name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-tight">Member</span>
                       <span className="font-black text-slate-900 tracking-tight">{user.full_name}</span>
                    </div>
                  </div>
                  <Link href="/account" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <User className="h-5 w-5 opacity-50" /> Account Settings
                  </Link>
                  <button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                    <LogOut className="h-5 w-5 opacity-50" /> Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="flex items-center justify-center rounded-xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-900 tracking-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    LOGIN
                  </Link>
                  <Link href="/signup" onClick={() => setMenuOpen(false)} className="flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-black text-white shadow-lg tracking-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
