import type { SupabaseClient } from '@supabase/supabase-js';
import type { Order, OrderItem, OrderStatus, PaginatedResponse } from '@/types';

export class OrderRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<Order | null> {
    const { data, error } = await this.supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as Order;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const { data, error } = await this.supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('order_number', orderNumber)
      .single();

    if (error) return null;
    return data as Order;
  }

  async findByUserId(userId: string, limit?: number): Promise<Order[]> {
    let query = this.supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) return [];
    return data as Order[];
  }

  async adminFindAll(
    page = 1,
    pageSize = 20,
    status?: OrderStatus
  ): Promise<PaginatedResponse<Order>> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = this.supabase
      .from('orders')
      .select('*, order_items(*), user:profiles(*)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query.range(from, to);

    if (error) return { data: [], count: 0, page, pageSize, totalPages: 0 };

    return {
      data: data as Order[],
      count: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  }

  async create(
    order: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'order_items' | 'user'>
  ): Promise<Order> {
    const { data, error } = await this.supabase
      .from('orders')
      .insert(order)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Order;
  }

  async createOrderItems(
    items: Omit<OrderItem, 'id' | 'created_at' | 'product'>[]
  ): Promise<OrderItem[]> {
    const { data, error } = await this.supabase
      .from('order_items')
      .insert(items)
      .select();

    if (error) throw new Error(error.message);
    return data as OrderItem[];
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const { data, error } = await this.supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Order;
  }

  async updateTrackingNumber(
    id: string,
    trackingNumber: string
  ): Promise<Order> {
    const { data, error } = await this.supabase
      .from('orders')
      .update({ tracking_number: trackingNumber })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Order;
  }

  async getDashboardStats() {
    const [totalResult, pendingResult, revenueResult, customersResult] =
      await Promise.all([
        this.supabase
          .from('orders')
          .select('*', { count: 'exact', head: true }),
        this.supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),
        this.supabase
          .from('orders')
          .select('total')
          .eq('status', 'delivered'),
        this.supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('is_admin', false),
      ]);

    const revenue = (revenueResult.data ?? []).reduce(
      (sum: number, o: { total: number }) => sum + (o.total ?? 0),
      0
    );

    return {
      totalOrders: totalResult.count ?? 0,
      pendingOrders: pendingResult.count ?? 0,
      revenue,
      customersCount: customersResult.count ?? 0,
    };
  }
}
