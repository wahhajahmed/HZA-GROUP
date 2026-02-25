'use server';

import type { ApiResponse, AreaDeliveryCharge } from '@/types';
import { createClient } from '@/lib/supabase/server';

/** Get all active area charges for a specific city */
export async function getAreaChargesByCity(
  city: string
): Promise<ApiResponse<AreaDeliveryCharge[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('area_delivery_charges')
      .select('*')
      .eq('city', city)
      .eq('is_active', true)
      .order('area', { ascending: true });

    if (error) return { data: null, error: error.message };
    return { data: data as AreaDeliveryCharge[], error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

/** Get a single area charge record (for DC calculation at checkout) */
export async function getAreaCharge(
  city: string,
  area: string
): Promise<ApiResponse<AreaDeliveryCharge>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('area_delivery_charges')
      .select('*')
      .eq('city', city)
      .eq('area', area)
      .eq('is_active', true)
      .maybeSingle();

    if (error) return { data: null, error: error.message };
    return { data: data as AreaDeliveryCharge | null, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

/** Get distinct active cities (for city dropdown) */
export async function getActiveCities(): Promise<ApiResponse<string[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('area_delivery_charges')
      .select('city')
      .eq('is_active', true)
      .order('city', { ascending: true });

    if (error) return { data: null, error: error.message };
    const cities = [...new Set((data ?? []).map((r: { city: string }) => r.city))];
    return { data: cities, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

// ─── Legacy stub ─────────────────────────────────────────────────────────────
export async function getCities(): Promise<ApiResponse<{ city: string; charge: number }[]>> {
  return { data: [], error: null };
}

