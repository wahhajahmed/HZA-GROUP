'use server';

import { revalidatePath } from 'next/cache';
import {
  adminGetAllOrders,
  adminGetOrderById,
  adminUpdateOrderStatus,
  adminUpdateOrderTracking,
  adminGetDashboardStats,
} from '@/repositories/order.repository';
import { sendReviewRequestEmail } from '@/lib/email';
import { createClient } from '@/lib/supabase/server';

export async function getAllOrders() {
  return adminGetAllOrders();
}

export async function getOrderById(id: string) {
  return adminGetOrderById(id);
}

export async function updateOrderStatus(id: string, status: string) {
  await adminUpdateOrderStatus(id, status);
  revalidatePath('/dashboard/orders');
  revalidatePath(`/dashboard/orders/${id}`);

  // Send review request email when order is marked delivered
  if (status === 'delivered') {
    try {
      const supabase = await createClient();
      const { data: order } = await supabase
        .from('orders')
        .select('customer_email, customer_name, order_number')
        .eq('id', id)
        .single();

      if (order && !order.reviewed) {
        await sendReviewRequestEmail({
          toEmail: order.customer_email,
          toName: order.customer_name,
          orderId: id,
          orderNumber: order.order_number,
        });
      }
    } catch (err) {
      console.error('[Order] Review email error:', err);
    }
  }
}

export async function updateOrderTracking(id: string, trackingNumber: string) {
  await adminUpdateOrderTracking(id, trackingNumber);
  revalidatePath(`/dashboard/orders/${id}`);
}

export async function getDashboardStats() {
  return adminGetDashboardStats();
}
