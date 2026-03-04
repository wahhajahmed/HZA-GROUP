import type { SupabaseClient } from '@supabase/supabase-js';
import type { Review } from '@/types';

export class ReviewRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(): Promise<(Review & { product_name?: string })[]> {
    // First get all reviews
    const { data: reviews, error } = await this.supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    
    // Fetch product names for reviews that have product_id
    const productIds = [...new Set((reviews ?? []).filter(r => r.product_id).map(r => r.product_id))];
    let productMap: Record<string, string> = {};
    if (productIds.length > 0) {
      const { data: products } = await this.supabase
        .from('products')
        .select('id, name')
        .in('id', productIds);
      if (products) {
        productMap = Object.fromEntries(products.map(p => [p.id, p.name]));
      }
    }

    return (reviews ?? []).map(r => ({
      ...r,
      product_name: r.product_id ? productMap[r.product_id] ?? undefined : undefined,
    }));
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
