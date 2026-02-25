import { getAllPromotions } from '@/services/promotion.service';
import PromotionsManager from './PromotionsManager';

export const dynamic = 'force-dynamic';

export default async function PromotionsPage() {
  const { data: promotions, error } = await getAllPromotions();

  if (error || !promotions) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-bold sm:text-2xl">Promotions</h1>
        <p className="text-red-500">{error ?? 'Failed to load promotions.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PromotionsManager initialPromotions={promotions} />
    </div>
  );
}
