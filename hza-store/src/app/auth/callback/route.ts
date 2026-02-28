import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash'); // Support token_hash as well
  const next = searchParams.get('next') ?? '/';
  const type = (searchParams.get('type') as any) ?? 'recovery';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const redirectPath = next === '/' ? '/account' : next;
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  } else if (tokenHash) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type,
    });
    if (!error) {
      const redirectPath = next === '/' ? '/account' : next;
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
