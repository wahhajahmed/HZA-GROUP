import type { SupabaseClient } from '@supabase/supabase-js';
import type { CartItem } from '@/types';

export class CartRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByUserId(userId: string): Promise<CartItem[]> {
    const { data, error } = await this.supabase
      .from('cart_items')
      .select('*, product:products(*, category:categories(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) return [];
    return data as CartItem[];
  }

  async findItem(userId: string, productId: string): Promise<CartItem | null> {
    const { data, error } = await this.supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (error) return null;
    return data as CartItem;
  }

  async addItem(
    userId: string,
    productId: string,
    quantity = 1
  ): Promise<CartItem> {
    const { data, error } = await this.supabase
      .from('cart_items')
      .insert({ user_id: userId, product_id: productId, quantity })
      .select('*, product:products(*)')
      .single();

    if (error) throw new Error(error.message);
    return data as CartItem;
  }

  async updateQuantity(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<CartItem> {
    const { data, error } = await this.supabase
      .from('cart_items')
      .update({ quantity })
      .eq('user_id', userId)
      .eq('product_id', productId)
      .select('*, product:products(*)')
      .single();

    if (error) throw new Error(error.message);
    return data as CartItem;
  }

  async removeItem(userId: string, productId: string): Promise<void> {
    const { error } = await this.supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) throw new Error(error.message);
  }

  async clearCart(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
  }
}
