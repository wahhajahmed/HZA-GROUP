import { createServerClient } from '@supabase/ssr';
import type { NextRequest, NextResponse } from 'next/server';

// Bypass navigator.locks to prevent lock timeout errors in some environments
const noopLock = async <R>(
  _name: string,
  _acquireTimeout: number,
  fn: () => Promise<R>
): Promise<R> => fn();

/**
 * Creates a Supabase client for use in Next.js middleware.
 * Manages cookie reading/writing on the request/response objects.
 */
export function createMiddlewareClient(
  request: NextRequest,
  response: NextResponse
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        lock: noopLock,
      },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );
}
