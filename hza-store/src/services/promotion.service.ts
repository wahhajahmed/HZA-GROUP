'use server';

import { createClient } from '@/lib/supabase/server';
import { PromotionRepository } from '@/repositories/promotion.repository';
import type { ApiResponse, Promotion } from '@/types';

export async function getActivePromotion(): Promise<ApiResponse<Promotion>> {
  try {
    const supabase = await createClient();
    const repo = new PromotionRepository(supabase);
    const data = await repo.findActive();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}
