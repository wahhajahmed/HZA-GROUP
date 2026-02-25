import type { SupabaseClient } from '@supabase/supabase-js';
import type { Promotion } from '@/types';

export class PromotionRepository {
  constructor(private supabase: SupabaseClient) {}

  /** Fetch the first currently active promotion (RLS filters by time + is_active) */
  async findActive(): Promise<Promotion | null> {
    const { data, error } = await this.supabase
      .from('promotions')
      .select('*')
      .limit(1)
      .maybeSingle();
    if (error) return null;
    return data as Promotion | null;
  }
}
