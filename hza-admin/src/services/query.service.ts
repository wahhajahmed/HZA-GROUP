'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { SupportQuery } from '@/types';

export async function getQueries(): Promise<SupportQuery[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('support_queries')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function replyToQuery(id: string, reply: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('support_queries')
    .update({ admin_reply: reply, status: 'replied', updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/queries');
}

export async function closeQuery(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('support_queries')
    .update({ status: 'closed', updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/queries');
}

export async function markAllQueriesRead(): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from('support_queries')
    .update({ is_read: true })
    .eq('is_read', false);
}
