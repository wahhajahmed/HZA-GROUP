import type { SupabaseClient } from '@supabase/supabase-js';
import type { Review } from '@/types';

export class ReviewRepository {
  constructor(private supabase: SupabaseClient) {}

  async findVisible(limit = 50): Promise<Review[]> {
    const { data, error } = await this.supabase
      .from('reviews')
      .select('*')
      .eq('is_visible', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async findByOrderId(orderId: string): Promise<Review | null> {
    const { data } = await this.supabase
      .from('reviews')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle();
    return data ?? null;
  }

  async create(input: {
    user_id: string;
    order_id: string;
    rating: number;
    comment: string;
    reviewer_name: string;
  }): Promise<Review> {
    const { data, error } = await this.supabase
      .from('reviews')
      .insert({ ...input, is_seeded: false, is_visible: true })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async markOrderReviewed(orderId: string): Promise<void> {
    const { error } = await this.supabase
      .from('orders')
      .update({ reviewed: true })
      .eq('id', orderId);
    if (error) throw new Error(error.message);
  }
}
