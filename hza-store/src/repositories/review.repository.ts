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

  /** Get visible reviews for a specific product */
  async findByProductId(productId: string, limit = 30): Promise<Review[]> {
    const { data, error } = await this.supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('is_visible', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    // If product_id column doesn't exist yet, return empty
    if (error?.message?.includes('product_id')) return [];
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  /** Get average rating and count for a product */
  async getProductRatingSummary(productId: string): Promise<{ avg: number; count: number; distribution: Record<number, number> }> {
    const empty = { avg: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    const { data, error } = await this.supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId)
      .eq('is_visible', true);
    // If product_id column doesn't exist yet, return empty summary
    if (error?.message?.includes('product_id')) return empty;
    if (error || !data || data.length === 0) return empty;
    const count = data.length;
    const sum = data.reduce((s, r) => s + r.rating, 0);
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    data.forEach((r) => { distribution[r.rating] = (distribution[r.rating] || 0) + 1; });
    return { avg: sum / count, count, distribution };
  }

  async create(input: {
    user_id: string;
    order_id: string;
    product_id?: string | null;
    rating: number;
    comment: string;
    reviewer_name: string;
  }): Promise<Review> {
    const { product_id, ...rest } = input;
    const insertData: Record<string, unknown> = { ...rest, is_seeded: false, is_visible: true };
    if (product_id) insertData.product_id = product_id;

    const { data, error } = await this.supabase
      .from('reviews')
      .insert(insertData)
      .select()
      .single();

    // If product_id column doesn't exist yet (migration not applied), retry without it
    if (error?.message?.includes('product_id') && insertData.product_id) {
      delete insertData.product_id;
      const { data: d2, error: e2 } = await this.supabase
        .from('reviews')
        .insert(insertData)
        .select()
        .single();
      if (e2) throw new Error(e2.message);
      return d2;
    }

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
