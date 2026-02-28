import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) return NextResponse.json({ ok: true });
    return NextResponse.json({ ok: false });
  } catch (err) {
    return NextResponse.json({ ok: false });
  }
}
