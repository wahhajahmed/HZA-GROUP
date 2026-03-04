'use client';

import { useState } from 'react';
import { Star, Eye, EyeOff, Trash2, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toggleReviewVisibility, deleteReview } from '@/services/review.service';
import type { Review } from '@/types';

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
        />
      ))}
    </span>
  );
}

type ReviewWithProduct = Review & { product_name?: string };

export default function ReviewsTable({ initialReviews }: { initialReviews: ReviewWithProduct[] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  const filtered = ratingFilter
    ? reviews.filter((r) => r.rating === ratingFilter)
    : reviews;

  async function handleToggle(id: string, current: boolean) {
    setLoadingId(id);
    const { error } = await toggleReviewVisibility(id, !current);
    if (!error) {
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_visible: !current } : r)),
      );
    }
    setLoadingId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this review? This cannot be undone.')) return;
    setLoadingId(id);
    const { error } = await deleteReview(id);
    if (!error) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
    }
    setLoadingId(null);
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border bg-white shadow-sm p-12 text-center text-gray-400">
        No reviews yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Rating filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">Filter by rating:</span>
        <button
          onClick={() => setRatingFilter(null)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            ratingFilter === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({reviews.length})
        </button>
        {[5, 4, 3, 2, 1].map((star) => {
          const count = reviews.filter((r) => r.rating === star).length;
          if (count === 0) return null;
          return (
            <button
              key={star}
              onClick={() => setRatingFilter(ratingFilter === star ? null : star)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                ratingFilter === star
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {star} <Star className="w-3 h-3 fill-current" /> ({count})
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Reviewer</th>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">Rating</th>
              <th className="px-4 py-3 text-left">Comment</th>
              <th className="px-4 py-3 text-left">Flags</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((review) => (
              <tr key={review.id} className={`hover:bg-gray-50 ${!review.is_visible ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3">
                  <p className="font-medium">{review.reviewer_name}</p>
                  <p className="text-xs text-gray-400 font-mono">{review.order_id?.slice(0, 8)}…</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-gray-700 line-clamp-1">
                    {review.product_name || <span className="italic text-gray-400">N/A</span>}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <StarRow rating={review.rating} />
                  <span className="text-xs text-gray-500 mt-0.5">{review.rating}/5</span>
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <p className="line-clamp-2 text-gray-700">{review.comment || <span className="italic text-gray-400">No comment</span>}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {review.is_seeded && (
                      <Badge variant="secondary" className="text-xs">Seeded</Badge>
                    )}
                    <Badge
                      variant={review.is_visible ? 'default' : 'outline'}
                      className="text-xs"
                    >
                      {review.is_visible ? 'Visible' : 'Hidden'}
                    </Badge>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                  {new Date(review.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={loadingId === review.id}
                      onClick={() => handleToggle(review.id, review.is_visible)}
                      title={review.is_visible ? 'Hide review' : 'Show review'}
                    >
                      {review.is_visible ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={loadingId === review.id}
                      onClick={() => handleDelete(review.id)}
                      className="text-red-500 hover:text-red-600 hover:border-red-200"
                      title="Delete review"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
