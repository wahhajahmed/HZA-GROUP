'use server';

import { createClient } from '@/lib/supabase/server';
import type { Order } from '@/types';

export async function adminGetAllOrders(): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(id, product_name, product_image, price, quantity, subtotal)')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function adminGetOrderById(id: string): Promise<Order | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(
        id, product_name, product_image, price, quantity, subtotal,
        selected_color, selected_size,
        product:products(id, variants:product_variants(color_name, color_hex))
      )
    `)
    .eq('id', id)
    .single();
  if (error) return null;
  return data as Order;
}

export async function adminUpdateOrderStatus(id: string, status: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function adminUpdateOrderTracking(id: string, trackingNumber: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('orders')
    .update({ tracking_number: trackingNumber, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function adminGetDashboardStats() {
  const supabase = await createClient();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [ordersRes, customersRes, revenueRes, lowStockRes] = await Promise.all([
    supabase.from('orders').select('id, status', { count: 'exact' }),
    supabase.from('profiles').select('id', { count: 'exact' }).eq('is_admin', false),
    supabase.from('orders').select('total').eq('status', 'delivered').gte('created_at', startOfMonth),
    supabase.from('products').select('id, name, stock').lt('stock', 5),
  ]);

  const monthlyRevenue = (revenueRes.data ?? []).reduce((sum, o) => sum + (o.total ?? 0), 0);
  return {
    totalOrders: ordersRes.count ?? 0,
    totalCustomers: customersRes.count ?? 0,
    monthlyRevenue,
    lowStockProducts: lowStockRes.data ?? [],
    pendingOrders: (ordersRes.data ?? []).filter((o) => o.status === 'pending').length,
  };
}
