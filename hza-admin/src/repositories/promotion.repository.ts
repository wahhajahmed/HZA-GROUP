import type { SupabaseClient } from '@supabase/supabase-js';
import type { Promotion } from '@/types';

export type PromotionInput = Omit<Promotion, 'id' | 'created_at'>;

export class PromotionRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(): Promise<Promotion[]> {
    const { data, error } = await this.supabase
      .from('promotions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data as Promotion[];
  }

  async findById(id: string): Promise<Promotion | null> {
    const { data, error } = await this.supabase
      .from('promotions')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data as Promotion;
  }

  async create(input: PromotionInput): Promise<Promotion> {
    const { data, error } = await this.supabase
      .from('promotions')
      .insert(input)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Promotion;
  }

  async update(id: string, input: Partial<PromotionInput>): Promise<Promotion> {
    const { data, error } = await this.supabase
      .from('promotions')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Promotion;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('promotions')
      .delete()
      .eq('id', id);
    if (error) throw new Error(error.message);
  }

  async toggleActive(id: string, is_active: boolean): Promise<void> {
    const { error } = await this.supabase
      .from('promotions')
      .update({ is_active })
      .eq('id', id);
    if (error) throw new Error(error.message);
  }
}
