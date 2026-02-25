import { createClient } from '@/lib/supabase/server';
import { getActivePromotion } from '@/services/promotion.service';
import PromotionBanner from './PromotionBanner';

/**
 * Server component: fetches active promotion, checks audience,
 * then renders the client-side PromotionBanner.
 */
export default async function PromotionWrapper() {
  const { data: promotion } = await getActivePromotion();
  if (!promotion) return null;

  // Audience check on the server
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { audience_type } = promotion;
  if (audience_type === 'logged_in' && !user) return null;
  if (audience_type === 'guest' && user) return null;

  return <PromotionBanner promotion={promotion} />;
}
