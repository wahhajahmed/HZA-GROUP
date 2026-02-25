'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { PromotionRepository, type PromotionInput } from '@/repositories/promotion.repository';
import type { ApiResponse, Promotion } from '@/types';

async function getRepo() {
  const supabase = await createClient();
  return new PromotionRepository(supabase);
}

export async function getAllPromotions(): Promise<ApiResponse<Promotion[]>> {
  try {
    const repo = await getRepo();
    const data = await repo.findAll();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function getPromotionById(id: string): Promise<ApiResponse<Promotion>> {
  try {
    const repo = await getRepo();
    const data = await repo.findById(id);
    if (!data) return { data: null, error: 'Not found' };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function createPromotion(input: PromotionInput): Promise<ApiResponse<Promotion>> {
  try {
    const repo = await getRepo();
    const data = await repo.create(input);
    revalidatePath('/dashboard/promotions');
    return { data, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function updatePromotion(
  id: string,
  input: Partial<PromotionInput>,
): Promise<ApiResponse<Promotion>> {
  try {
    const repo = await getRepo();
    const data = await repo.update(id, input);
    revalidatePath('/dashboard/promotions');
    return { data, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function deletePromotion(id: string): Promise<ApiResponse<null>> {
  try {
    const repo = await getRepo();
    await repo.delete(id);
    revalidatePath('/dashboard/promotions');
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function togglePromotionActive(
  id: string,
  is_active: boolean,
): Promise<ApiResponse<null>> {
  try {
    const repo = await getRepo();
    await repo.toggleActive(id, is_active);
    revalidatePath('/dashboard/promotions');
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}
