'use client';

import { useRef, useEffect } from 'react';
import type { Review } from '@/types';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const initials = review.reviewer_name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Deterministic pastel colour from name
  const colours = [
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-emerald-100 text-emerald-700',
    'bg-orange-100 text-orange-700',
    'bg-pink-100 text-pink-700',
    'bg-indigo-100 text-indigo-700',
  ];
  const colour = colours[review.reviewer_name.charCodeAt(0) % colours.length];

  return (
    <div className="mx-4 mb-4 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm p-5">
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${colour}`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="font-semibold text-white text-sm">{review.reviewer_name}</p>
            <StarRating rating={review.rating} />
          </div>
          {review.comment && (
            <p className="mt-2 text-sm text-blue-100 leading-relaxed line-clamp-3">
              &ldquo;{review.comment}&rdquo;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface ReviewsSliderProps {
  reviews: Review[];
}

export function ReviewsSlider({ reviews }: ReviewsSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const posRef = useRef(0);

  // Double the list for seamless infinite loop
  const doubled = [...reviews, ...reviews];

  useEffect(() => {
    const container = containerRef.current;
    if (!container || reviews.length === 0) return;

    const speed = 0.5; // px per frame
    const halfHeight = container.scrollHeight / 2;

    function tick() {
      posRef.current += speed;
      if (posRef.current >= halfHeight) {
        posRef.current = 0;
      }
      if (container) {
        container.style.transform = `translateY(-${posRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(tick);
    }

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [reviews.length]);

  if (reviews.length === 0) return null;

  return (
    <div className="overflow-hidden h-[340px]">
      <div ref={containerRef} className="will-change-transform">
        {doubled.map((review, i) => (
          <ReviewCard key={`${review.id}-${i}`} review={review} />
        ))}
      </div>
    </div>
  );
}
