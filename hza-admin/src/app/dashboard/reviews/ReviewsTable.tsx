'use client';

import { useState } from 'react';
import { Star, Eye, EyeOff, Trash2 } from 'lucide-react';
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

export default function ReviewsTable({ initialReviews }: { initialReviews: Review[] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [loadingId, setLoadingId] = useState<string | null>(null);

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
    <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
      <table className="w-full text-sm min-w-[700px]">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-3 text-left">Reviewer</th>
            <th className="px-4 py-3 text-left">Rating</th>
            <th className="px-4 py-3 text-left">Comment</th>
            <th className="px-4 py-3 text-left">Flags</th>
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {reviews.map((review) => (
            <tr key={review.id} className={`hover:bg-gray-50 ${!review.is_visible ? 'opacity-50' : ''}`}>
              <td className="px-4 py-3">
                <p className="font-medium">{review.reviewer_name}</p>
                <p className="text-xs text-gray-400 font-mono">{review.order_id?.slice(0, 8)}…</p>
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
  );
}
