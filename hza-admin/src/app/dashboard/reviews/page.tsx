import { Star } from 'lucide-react';
import { getAllReviews } from '@/services/review.service';
import ReviewsTable from './ReviewsTable';

export const dynamic = 'force-dynamic';

/* Map dynamic percentage to a static Tailwind width class (nearest 5%) */
const WIDTH_MAP: Record<number, string> = {
  0:'w-0',5:'w-[5%]',10:'w-[10%]',15:'w-[15%]',20:'w-1/5',25:'w-1/4',
  30:'w-[30%]',35:'w-[35%]',40:'w-2/5',45:'w-[45%]',50:'w-1/2',
  55:'w-[55%]',60:'w-3/5',65:'w-[65%]',70:'w-[70%]',75:'w-3/4',
  80:'w-4/5',85:'w-[85%]',90:'w-[90%]',95:'w-[95%]',100:'w-full',
};
function pctWidthClass(pct: number) {
  const r = Math.max(0, Math.min(100, Math.round(pct / 5) * 5));
  return WIDTH_MAP[r] || 'w-0';
}

export default async function ReviewsPage() {
  const { data: reviews, error } = await getAllReviews();

  if (error || !reviews) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-bold sm:text-2xl">Reviews</h1>
        <p className="text-red-500">{error ?? 'Failed to load reviews.'}</p>
      </div>
    );
  }

  const visible = reviews.filter((r) => r.is_visible).length;
  const hidden = reviews.filter((r) => !r.is_visible).length;
  const avg =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '—';

  // Rating distribution
  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => { distribution[r.rating] = (distribution[r.rating] || 0) + 1; });
  const maxCount = Math.max(...Object.values(distribution), 1);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold sm:text-2xl">Reviews ({reviews.length})</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Reviews', value: reviews.length },
          { label: 'Visible', value: visible },
          { label: 'Hidden', value: hidden },
          {
            label: 'Avg Rating',
            value: (
              <span className="flex items-center gap-1">
                {avg}
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              </span>
            ),
          },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border shadow-sm p-4">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Rating Distribution */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Rating Distribution</p>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-3">
                <span className="flex items-center gap-0.5 w-14 text-sm text-gray-600">
                  {star} <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`bg-yellow-400 h-2.5 rounded-full transition-all ${pctWidthClass((distribution[star] / maxCount) * 100)}`}
                  />
                </div>
                <span className="text-sm text-gray-500 w-8 text-right">{distribution[star]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <ReviewsTable initialReviews={reviews} />
    </div>
  );
}
