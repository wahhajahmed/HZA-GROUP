'use server';

import { createClient } from '@/lib/supabase/server';
import type { Category } from '@/types';

export async function adminGetCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function adminCreateCategory(payload: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminUpdateCategory(id: string, payload: Partial<Category>): Promise<Category> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminDeleteCategory(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function adminUploadCategoryImage(file: File): Promise<string> {
  const supabase = await createClient();
  const ext = file.name.split('.').pop();
  const path = `categories/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('category-images').upload(path, file, { upsert: true });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from('category-images').getPublicUrl(path);
  return data.publicUrl;
}
