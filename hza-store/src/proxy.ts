import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/middleware';

const AUTH_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email'];
const PROTECTED_ROUTES = ['/cart', '/checkout', '/orders', '/account'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Let auth pages through immediately — no Supabase call needed ──
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next({ request });
  }

  // ── Only call Supabase for routes that actually need auth checks ──
  const needsAuth =
    pathname.startsWith('/admin') ||
    PROTECTED_ROUTES.some((r) => pathname.startsWith(r));

  if (!needsAuth) {
    return NextResponse.next({ request });
  }

  const response = NextResponse.next({ request });
  const supabase = createMiddlewareClient(request, response);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ──────────────────────────────────────────────
  // ADMIN PROTECTION
  // ──────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, is_blocked')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin || profile?.is_blocked) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return response;
  }

  // ──────────────────────────────────────────────
  // PROTECTED USER ROUTES
  // ──────────────────────────────────────────────
  if (PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_blocked')
      .eq('id', user.id)
      .single();

    if (profile?.is_blocked) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/login?blocked=true', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|images|icons).*)',
  ],
};
