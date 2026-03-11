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

  async findItem(
    userId: string,
    productId: string,
    selectedColor?: string | null,
    selectedSize?: string | null,
  ): Promise<CartItem | null> {
    let query = this.supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (selectedColor != null) {
      query = query.eq('selected_color', selectedColor);
    } else {
      query = query.is('selected_color', null);
    }
    if (selectedSize != null) {
      query = query.eq('selected_size', selectedSize);
    } else {
      query = query.is('selected_size', null);
    }

    const { data, error } = await query.maybeSingle();
    if (error) return null;
    return data as CartItem | null;
  }

  async addItem(
    userId: string,
    productId: string,
    quantity = 1,
    selectedColor?: string | null,
    selectedSize?: string | null,
    selectedImage?: string | null,
  ): Promise<CartItem> {
    const { data, error } = await this.supabase
      .from('cart_items')
      .insert({
        user_id: userId,
        product_id: productId,
        quantity,
        selected_color: selectedColor ?? null,
        selected_size: selectedSize ?? null,
        selected_image: selectedImage ?? null,
      })
      .select('*, product:products(*)')
      .single();

    if (error) throw new Error(error.message);
    return data as CartItem;
  }

  async updateQuantity(
    userId: string,
    productId: string,
    quantity: number,
    selectedColor?: string | null,
    selectedSize?: string | null,
  ): Promise<CartItem> {
    let query = this.supabase
      .from('cart_items')
      .update({ quantity })
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (selectedColor != null) {
      query = query.eq('selected_color', selectedColor);
    } else {
      query = query.is('selected_color', null);
    }
    if (selectedSize != null) {
      query = query.eq('selected_size', selectedSize);
    } else {
      query = query.is('selected_size', null);
    }

    const { data, error } = await query
      .select('*, product:products(*)')
      .single();

    if (error) throw new Error(error.message);
    return data as CartItem;
  }

  async removeItem(
    userId: string,
    productId: string,
    selectedColor?: string | null,
    selectedSize?: string | null,
  ): Promise<void> {
    let query = this.supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (selectedColor !== undefined) {
      query = selectedColor != null
        ? query.eq('selected_color', selectedColor)
        : query.is('selected_color', null);
    }
    if (selectedSize !== undefined) {
      query = selectedSize != null
        ? query.eq('selected_size', selectedSize)
        : query.is('selected_size', null);
    }

    const { error } = await query;
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

