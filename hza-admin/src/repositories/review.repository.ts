import type { SupabaseClient } from '@supabase/supabase-js';
import type { Review } from '@/types';

export class ReviewRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(): Promise<Review[]> {
    const { data, error } = await this.supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data as Review[];
  }

  async updateVisibility(id: string, is_visible: boolean): Promise<void> {
    const { error } = await this.supabase
      .from('reviews')
      .update({ is_visible })
      .eq('id', id);
    if (error) throw new Error(error.message);
  }

  async deleteReview(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('reviews')
      .delete()
      .eq('id', id);
    if (error) throw new Error(error.message);
  }
}
