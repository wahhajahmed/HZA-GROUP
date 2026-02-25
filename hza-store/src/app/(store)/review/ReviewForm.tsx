'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { submitReview } from '@/services/review.service';

interface ReviewFormProps {
  orderId: string;
  orderNumber: string;
}

export default function ReviewForm({ orderId, orderNumber }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setError('Please select a star rating.'); return; }
    setLoading(true);
    setError('');
    const { error: err } = await submitReview({ orderId, rating, comment });
    setLoading(false);
    if (err) { setError(err); return; }
    setSuccess(true);
    // Redirect to confirmation after 2 s
    setTimeout(() => router.push('/orders'), 2000);
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank you for your review!</h2>
        <p className="text-gray-500">Redirecting you to your orders…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">
          Reviewing order <span className="font-semibold text-blue-600">#{orderNumber}</span>
        </p>
        <p className="text-sm text-gray-500">Your feedback helps other shoppers and improves our service.</p>
      </div>

      {/* Star Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating *</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="focus:outline-none"
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
            >
              <Star
                className={`w-9 h-9 transition-colors ${
                  star <= (hovered || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="mt-1 text-xs text-gray-500">
            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
          </p>
        )}
      </div>

      {/* Comment */}
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          Your Review <span className="text-gray-400">(optional)</span>
        </label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us about your experience with this order…"
          rows={5}
          maxLength={1000}
          className="resize-none"
        />
        <p className="mt-1 text-xs text-gray-400 text-right">{comment.length}/1000</p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>
      )}

      <Button
        type="submit"
        disabled={loading || rating === 0}
        className="w-full bg-blue-600 hover:bg-blue-700"
        size="lg"
      >
        {loading ? 'Submitting…' : 'Submit Review'}
      </Button>
    </form>
  );
}
