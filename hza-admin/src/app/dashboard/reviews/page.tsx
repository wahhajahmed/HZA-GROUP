import { Star } from 'lucide-react';
import { getAllReviews } from '@/services/review.service';
import ReviewsTable from './ReviewsTable';

export const dynamic = 'force-dynamic';

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

      <ReviewsTable initialReviews={reviews} />
    </div>
  );
}
