'use server';

import { createClient } from '@/lib/supabase/server';
import { ReviewRepository } from '@/repositories/review.repository';
import type { ApiResponse, Review } from '@/types';

async function getRepo() {
  const supabase = await createClient();
  return { repo: new ReviewRepository(supabase), supabase };
}

/** All visible reviews for homepage slider */
export async function getVisibleReviews(): Promise<ApiResponse<Review[]>> {
  try {
    const { repo } = await getRepo();
    const data = await repo.findVisible(60);
    return { data, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

/** Submit a review for a delivered order */
export async function submitReview(input: {
  orderId: string;
  rating: number;
  comment: string;
}): Promise<ApiResponse<Review>> {
  try {
    const { repo, supabase } = await getRepo();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Please login to submit a review.' };

    // Validate order belongs to user and is delivered
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('id, order_number, status, reviewed, customer_name')
      .eq('id', input.orderId)
      .eq('user_id', user.id)
      .single();

    if (orderErr || !order) return { data: null, error: 'Order not found.' };
    if (order.status !== 'delivered') return { data: null, error: 'You can only review delivered orders.' };
    if (order.reviewed) return { data: null, error: 'You have already reviewed this order.' };

    // Get profile name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const review = await repo.create({
      user_id: user.id,
      order_id: input.orderId,
      rating: input.rating,
      comment: input.comment,
      reviewer_name: profile?.full_name ?? order.customer_name ?? 'Customer',
    });

    await repo.markOrderReviewed(input.orderId);

    return { data: review, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

/** Get order info from review token (orderId) — validates user owns it */
export async function getOrderForReview(token: string): Promise<ApiResponse<{
  orderId: string;
  orderNumber: string;
  alreadyReviewed: boolean;
  isDelivered: boolean;
}>> {
  try {
    const { supabase } = await getRepo();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'login_required' };

    const { data: order } = await supabase
      .from('orders')
      .select('id, order_number, status, reviewed')
      .eq('id', token)
      .eq('user_id', user.id)
      .single();

    if (!order) return { data: null, error: 'Order not found.' };

    return {
      data: {
        orderId: order.id,
        orderNumber: order.order_number,
        alreadyReviewed: order.reviewed === true,
        isDelivered: order.status === 'delivered',
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}
