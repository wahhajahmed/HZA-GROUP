'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth.store';
import type { Profile } from '@/types';

async function fetchAndSetUser(
  supabase: ReturnType<typeof createClient>,
  sessionUser: { id: string; email?: string; user_metadata?: Record<string, string> },
  setUser: (u: Profile | null) => void,
  setLoading: (v: boolean) => void
) {
  setLoading(false);
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', sessionUser.id)
    .single();

  if (profile) {
    setUser(profile as Profile);
  } else {
    // Profile row doesn't exist yet — build a minimal one from session metadata
    // so the Navbar still shows the user as logged in
    const fallback: Profile = {
      id: sessionUser.id,
      email: sessionUser.email ?? '',
      full_name:
        sessionUser.user_metadata?.full_name ??
        sessionUser.email?.split('@')[0] ??
        'User',
      phone: sessionUser.user_metadata?.phone ?? null,
      is_admin: false,
      is_blocked: false,
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setUser(fallback);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchAndSetUser(supabase, session.user, setUser, setLoading);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchAndSetUser(supabase, session.user, setUser, setLoading);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading]);

  return <>{children}</>;
}
