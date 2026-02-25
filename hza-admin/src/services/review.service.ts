'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ReviewRepository } from '@/repositories/review.repository';
import type { ApiResponse, Review } from '@/types';

async function getRepo() {
  const supabase = await createClient();
  return new ReviewRepository(supabase);
}

export async function getAllReviews(): Promise<ApiResponse<Review[]>> {
  try {
    const repo = await getRepo();
    const data = await repo.findAll();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function toggleReviewVisibility(
  id: string,
  is_visible: boolean,
): Promise<ApiResponse<null>> {
  try {
    const repo = await getRepo();
    await repo.updateVisibility(id, is_visible);
    revalidatePath('/dashboard/reviews');
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export async function deleteReview(id: string): Promise<ApiResponse<null>> {
  try {
    const repo = await getRepo();
    await repo.deleteReview(id);
    revalidatePath('/dashboard/reviews');
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}
