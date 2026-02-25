'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Profile } from '@/types';

export async function adminSignIn(email: string, password: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);

  // Verify admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', data.user.id)
    .single();

  if (!profile?.is_admin) {
    await supabase.auth.signOut();
    throw new Error('Access denied: not an admin');
  }
  return data.user;
}

export async function adminSignOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export async function adminGetAllUsers(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_admin', false)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
