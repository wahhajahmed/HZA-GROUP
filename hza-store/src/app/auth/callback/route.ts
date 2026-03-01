import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash'); // Support token_hash as well
  const next = searchParams.get('next');
  const type = (searchParams.get('type') as any) ?? 'recovery';

  // Determine default redirect path:
  // - For password recovery, go to `/reset-password` by default (handles cases
  //   where Supabase returns tokens in the URL fragment and `next` isn't visible
  //   to the server).
  // - Otherwise, use `next` when provided, or fall back to `/account`.
  const defaultRedirect = type === 'recovery' ? '/reset-password' : '/account';
  const redirectTarget = next ? (next === '/' ? '/account' : next) : defaultRedirect;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectTarget}`);
    }
  } else if (tokenHash) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type,
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectTarget}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
