'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { OrderRepository } from '@/repositories/order.repository';
import { CartRepository } from '@/repositories/cart.repository';
import { ProductRepository } from '@/repositories/product.repository';
import type { ApiResponse, Order, OrderStatus, CheckoutInput } from '@/types';
import { getEffectivePrice, normalizePakistaniPhone } from '@/lib/utils';
import { calculateDeliveryCharge, getEffectiveShippingCategory, type ShippingCategory } from '@/lib/dc-calculator';

async function getRepos() {
  const supabase = await createClient();
  return {
    order: new OrderRepository(supabase),
    cart: new CartRepository(supabase),
    product: new ProductRepository(supabase),
    supabase,
  };
}

export async function placeOrder(
  input: CheckoutInput
): Promise<ApiResponse<Order>> {
  try {
    const { order, cart, product, supabase } = await getRepos();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Please login to place an order' };

    // Get cart items
    const cartItems = await cart.findByUserId(user.id);
    if (cartItems.length === 0)
      return { data: null, error: 'Your cart is empty' };

    // Atomically validate & decrement stock for ALL items in one transaction
    // This prevents race conditions where two users buy the last item simultaneously
    const productIds = cartItems.map((item) => item.product_id);
    const quantities = cartItems.map((item) => item.quantity);

    const { error: stockError } = await supabase.rpc('validate_and_decrement_stock', {
      p_product_ids: productIds,
      p_quantities: quantities,
    });

    if (stockError) {
      // The RPC raises descriptive exceptions for out-of-stock / insufficient stock
      const msg = stockError.message || 'Stock validation failed';
      return { data: null, error: msg };
    }

    // Stock has been reserved — proceed with order creation.
    // If anything below fails the stock is already decremented, but this is the
    // safer side (prevents overselling). An admin can manually adjust if needed.

    // Calculate delivery charge using area_delivery_charges + scaling formula
    const { data: areaChargeData } = await supabase
      .from('area_delivery_charges')
      .select('small_parcel_charge, medium_parcel_charge, bulky_cargo_charge')
      .eq('city', input.city)
      .eq('area', input.area)
      .eq('is_active', true)
      .maybeSingle();

    const deliveryCharge = areaChargeData
      ? calculateDeliveryCharge(
        cartItems.map((item) => ({
          shipping_category: getEffectiveShippingCategory(
            ((item.product as { shipping_category?: string } | null | undefined)?.shipping_category ?? 'small_parcel') as ShippingCategory,
            ((item.product as { category?: { default_shipping_category?: string } } | null | undefined)?.category?.default_shipping_category ?? 'small_parcel') as ShippingCategory
          ),
          quantity: item.quantity,
        })),
        {
          small_parcel_charge: areaChargeData.small_parcel_charge,
          medium_parcel_charge: areaChargeData.medium_parcel_charge,
          bulky_cargo_charge: areaChargeData.bulky_cargo_charge,
        }
      )
      : 0;

    // Calculate subtotal
    const subtotal = cartItems.reduce((sum, item) => {
      const price = getEffectivePrice(
        item.product!.price,
        item.product!.discount_price
      );
      return sum + price * item.quantity;
    }, 0);

    const total = subtotal + deliveryCharge;

    // Generate order number
    const { data: orderNumData } = await supabase.rpc('generate_order_number');
    const orderNumber = orderNumData as string;

    // Get user profile for email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    // Create order
    const newOrder = await order.create({
      order_number: orderNumber,
      user_id: user.id,
      status: 'pending',
      customer_name: input.name,
      customer_phone: normalizePakistaniPhone(input.phone) ?? input.phone,
      customer_email: profile?.email ?? user.email ?? '',
      address: input.address,
      city: input.city,
      area: input.area ?? null,
      notes: input.notes ?? null,
      subtotal,
      delivery_charge: deliveryCharge,
      total,
      tracking_number: null,
      payment_method: 'cash_on_delivery',
    });

    console.log('[PlaceOrder] Success:', newOrder);

    // Create order items
    const orderItems = cartItems.map((item) => ({
      order_id: newOrder.id,
      product_id: item.product_id,
      product_name: item.product!.name,
      product_image: item.selected_image ?? item.product!.images[0] ?? null,
      price: getEffectivePrice(
        item.product!.price,
        item.product!.discount_price
      ),
      quantity: item.quantity,
      subtotal:
        getEffectivePrice(item.product!.price, item.product!.discount_price) *
        item.quantity,
      selected_color: item.selected_color ?? null,
      selected_size: item.selected_size ?? null,
    }));

    await order.createOrderItems(orderItems);

    // Clear cart
    await cart.clearCart(user.id);

    // Notify admin cache that a new order exists
    revalidatePath('/admin/orders');
    revalidatePath('/admin');

    return { data: newOrder, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function getUserOrders(limit?: number): Promise<ApiResponse<Order[]>> {
  try {
    const { order, supabase } = await getRepos();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { data: null, error: 'Not authenticated' };

    const orders = await order.findByUserId(user.id, limit);
    return { data: orders, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

/** Get delivered but unreviewed orders for review reminder popup */
export async function getUnreviewedDeliveredOrders(): Promise<ApiResponse<Order[]>> {
  try {
    const { supabase } = await getRepos();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('orders')
      .select('id, order_number, status, reviewed, customer_name, total, created_at, updated_at')
      .eq('user_id', user.id)
      .eq('status', 'delivered')
      .or('reviewed.is.null,reviewed.eq.false')
      .order('updated_at', { ascending: false })
      .limit(3);

    if (error) return { data: null, error: error.message };
    return { data: (data as Order[]) ?? [], error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function getOrderById(id: string): Promise<ApiResponse<Order>> {
  try {
    const { order, supabase } = await getRepos();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { data: null, error: 'Not authenticated' };

    const ord = await order.findById(id);
    if (!ord) return { data: null, error: 'Order not found' };

    // Security: user can only view their own orders
    if (ord.user_id !== user.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (!profile?.is_admin)
        return { data: null, error: 'Unauthorized' };
    }

    return { data: ord, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function adminUpdateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<ApiResponse<Order>> {
  try {
    const { order } = await getRepos();
    const updated = await order.updateStatus(orderId, status);
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/orders', 'layout');
    return { data: updated, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function adminUpdateTracking(
  orderId: string,
  trackingNumber: string
): Promise<ApiResponse<Order>> {
  try {
    const { order } = await getRepos();
    const updated = await order.updateTrackingNumber(orderId, trackingNumber);
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/orders', 'layout');
    return { data: updated, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function adminGetDashboardStats() {
  try {
    const { order, product, supabase } = await getRepos();
    const stats = await order.getDashboardStats();
    const lowStockItems = await product.findLowStock(5);

    // Get recent 5 orders
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, total, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    return {
      data: {
        totalOrders: stats.totalOrders,
        pendingOrders: stats.pendingOrders,
        totalRevenue: stats.revenue,
        customersCount: stats.customersCount,
        lowStockProducts: lowStockItems.length,
        recentOrders: recentOrders || [],
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function adminGetAllOrders(opts?: {
  status?: string
  page?: number
  limit?: number
}): Promise<ApiResponse<Order[]> & { total?: number }> {
  try {
    const { supabase } = await getRepos();
    const page = opts?.page || 1
    const limit = opts?.limit || 20
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from('orders')
      .select('*, order_items(quantity)', { count: 'exact' })

    if (opts?.status) {
      query = query.eq('status', opts.status)
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) return { data: null, error: error.message }
    return { data: data as Order[], error: null, total: count || 0 }
  } catch (err) {
    return { data: null, error: (err as Error).message }
  }
}

export async function adminGetOrderById(id: string): Promise<ApiResponse<Order>> {
  try {
    const { supabase } = await getRepos();
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, product:products(name, images, slug))')
      .eq('id', id)
      .single()

    if (error) return { data: null, error: error.message }
    return { data: data as Order, error: null }
  } catch (err) {
    return { data: null, error: (err as Error).message }
  }
}

