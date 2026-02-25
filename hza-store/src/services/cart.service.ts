'use server';

import { createClient } from '@/lib/supabase/server';
import { CartRepository } from '@/repositories/cart.repository';
import { ProductRepository } from '@/repositories/product.repository';
import type { ApiResponse, CartItem } from '@/types';

async function getRepos() {
  const supabase = await createClient();
  return {
    cart: new CartRepository(supabase),
    product: new ProductRepository(supabase),
    supabase,
  };
}

export async function getCart(): Promise<ApiResponse<CartItem[]>> {
  try {
    const { cart, supabase } = await getRepos();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { data: [], error: null };

    const items = await cart.findByUserId(user.id);
    return { data: items, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function addToCart(
  productId: string
): Promise<ApiResponse<CartItem>> {
  try {
    const { cart, product, supabase } = await getRepos();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { data: null, error: 'Please login to add items to cart' };

    // Check product exists and is active
    const prod = await product.findById(productId);
    if (!prod) return { data: null, error: 'Product not found' };
    if (prod.stock === 0) return { data: null, error: 'Product is out of stock' };

    // Check if already in cart
    const existing = await cart.findItem(user.id, productId);
    if (existing) return { data: null, error: 'Item already in your cart' };

    const item = await cart.addItem(user.id, productId);
    return { data: item, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function updateCartItemQuantity(
  productId: string,
  quantity: number
): Promise<ApiResponse<CartItem>> {
  try {
    const { cart, product, supabase } = await getRepos();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { data: null, error: 'Not authenticated' };

    if (quantity < 1) return { data: null, error: 'Quantity must be at least 1' };

    // Validate against stock
    const prod = await product.findById(productId);
    if (!prod) return { data: null, error: 'Product not found' };
    if (quantity > prod.stock)
      return {
        data: null,
        error: `Only ${prod.stock} items available in stock`,
      };

    const item = await cart.updateQuantity(user.id, productId, quantity);
    return { data: item, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function removeFromCart(
  productId: string
): Promise<ApiResponse<null>> {
  try {
    const { cart, supabase } = await getRepos();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { data: null, error: 'Not authenticated' };

    await cart.removeItem(user.id, productId);
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function clearCart(): Promise<ApiResponse<null>> {
  try {
    const { cart, supabase } = await getRepos();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { data: null, error: 'Not authenticated' };

    await cart.clearCart(user.id);
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}
