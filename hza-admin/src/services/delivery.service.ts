'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { AreaDeliveryCharge } from '@/types';

const TABLE = 'area_delivery_charges';
const REVALIDATE = '/dashboard/delivery';

export async function getDeliveryCharges(): Promise<AreaDeliveryCharge[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('city')
    .order('area');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getChargesByCity(city: string): Promise<AreaDeliveryCharge[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('city', city)
    .order('area');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function upsertAreaCharge(
  payload: Omit<AreaDeliveryCharge, 'id' | 'created_at' | 'updated_at'>
): Promise<AreaDeliveryCharge> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(payload, { onConflict: 'city,area' })
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath(REVALIDATE);
  return data;
}

export async function updateAreaCharge(
  id: string,
  payload: Partial<AreaDeliveryCharge>
): Promise<AreaDeliveryCharge> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath(REVALIDATE);
  return data;
}

export async function deleteAreaCharge(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath(REVALIDATE);
}

