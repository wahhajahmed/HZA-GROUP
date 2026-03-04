'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Product, Review } from '@/types';
import {
  formatCurrency,
  getEffectivePrice,
  getDiscountPercent,
} from '@/lib/utils';
import { addToCart } from '@/services/cart.service';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface RatingSummary {
  avg: number;
  count: number;
  distribution: Record<number, number>;
}

interface Props {
  product: Product;
  reviews?: Review[];
  ratingSummary?: RatingSummary;
}

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

export function ProductDetailClient({ product, reviews = [], ratingSummary }: Props) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { items, addItem } = useCartStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  /* Touch / swipe state */
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isDragging = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const savedImageRef = useRef(0);

  /* Sync slider transform via DOM ref (avoids inline style attribute) */
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.style.transform = `translateX(calc(-${selectedImage * 100}% + ${dragOffset}px))`;
    el.style.transitionDuration = dragOffset !== 0 ? '0ms' : '300ms';
  }, [selectedImage, dragOffset]);

  const images = product.images.length > 0 ? product.images : ['/images/product-placeholder.png'];

  const goTo = useCallback((idx: number) => {
    setSelectedImage(Math.max(0, Math.min(images.length - 1, idx)));
  }, [images.length]);

  /* Auto-slide on hover */
  const startAutoPlay = useCallback(() => {
    if (images.length <= 1) return;
    savedImageRef.current = selectedImage;
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setSelectedImage((prev) => (prev + 1) % images.length);
    }, 1200);
  }, [images.length, selectedImage]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
    setSelectedImage(savedImageRef.current);
  }, []);

  /* Cleanup interval on unmount */
  useEffect(() => {
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    isDragging.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    touchStartX.current = clientX;
    touchEndX.current = clientX;
    setDragOffset(0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    touchEndX.current = clientX;
    setDragOffset(clientX - touchStartX.current);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const diff = touchEndX.current - touchStartX.current;
    const SWIPE_THRESHOLD = 50;
    if (diff < -SWIPE_THRESHOLD) {
      goTo(selectedImage + 1);
    } else if (diff > SWIPE_THRESHOLD) {
      goTo(selectedImage - 1);
    }
    setDragOffset(0);
  }, [goTo, selectedImage]);

  const cartItem = items.find((i) => i.product_id === product.id);
  const isInCart = !!cartItem;
  const effectivePrice = getEffectivePrice(product.price, product.discount_price);
  const discountPercent = getDiscountPercent(product.price, product.discount_price);
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      router.push('/login?next=' + encodeURIComponent(`/products/${product.slug}`));
      return;
    }

    if (isInCart) {
      router.push('/cart');
      return;
    }

    setIsLoading(true);
    const { data, error } = await addToCart(product.id);
    setIsLoading(false);

    if (error) {
      if (error === 'Item already in your cart') {
        toast.info('Item already in your cart');
        router.push('/cart');
      } else {
        toast.error(error);
      }
      return;
    }

    if (data) {
      addItem({ ...data, product });
      toast.success('Added to cart!');
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        {product.category && (
          <>
            <Link
              href={`/categories/${product.category.slug}`}
              className="hover:text-blue-600"
            >
              {product.category.name}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
          </>
        )}
        <span className="text-gray-900 font-medium line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Images — Swipeable Slider */}
        <div className="space-y-3">
          <div
            className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 select-none cursor-grab active:cursor-grabbing"
            onMouseEnter={startAutoPlay}
            onMouseLeave={() => {
              if (isDragging.current) handleTouchEnd();
              stopAutoPlay();
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={(e) => {
              // Pause auto-slide while dragging
              if (autoPlayRef.current) { clearInterval(autoPlayRef.current); autoPlayRef.current = null; }
              handleTouchStart(e);
            }}
            onMouseMove={handleTouchMove}
            onMouseUp={() => {
              handleTouchEnd();
              // Resume auto-slide after drag
              savedImageRef.current = selectedImage;
              startAutoPlay();
            }}
          >
            {/* Sliding track */}
            <div
              ref={trackRef}
              className="flex h-full transition-transform duration-300 ease-out"
            >
              {images.map((img, idx) => (
                <div key={idx} className="relative flex-shrink-0 w-full h-full">
                  <Image
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    fill
                    className="object-contain p-4 pointer-events-none"
                    priority={idx === 0}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    draggable={false}
                  />
                </div>
              ))}
            </div>

            {/* Discount badge */}
            {discountPercent > 0 && (
              <Badge variant="destructive" className="absolute top-3 left-3 z-10">
                -{discountPercent}%
              </Badge>
            )}

            {/* Arrow nav (desktop) */}
            {images.length > 1 && (
              <>
                {selectedImage > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); goTo(selectedImage - 1); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-700" />
                  </button>
                )}
                {selectedImage < images.length - 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); goTo(selectedImage + 1); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-700" />
                  </button>
                )}
              </>
            )}

            {/* Dot indicators */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); goTo(idx); }}
                    className={`h-2 rounded-full transition-all ${
                      selectedImage === idx
                        ? 'w-6 bg-blue-500'
                        : 'w-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  aria-label={`View image ${idx + 1}`}
                  className={`relative flex-shrink-0 h-16 w-16 rounded-lg border-2 overflow-hidden ${
                    selectedImage === idx
                      ? 'border-blue-500'
                      : 'border-gray-200 hover:border-gray-400'
                  } transition-colors`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-5">
          {product.category && (
            <Link
              href={`/categories/${product.category.slug}`}
              className="text-sm font-medium text-blue-600 uppercase tracking-wide hover:underline w-fit"
            >
              {product.category.name}
            </Link>
          )}

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">
            {product.name}
          </h1>

          {/* Rating summary */}
          {ratingSummary && ratingSummary.count > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-5 h-5 ${s <= Math.round(ratingSummary.avg) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700">{ratingSummary.avg.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({ratingSummary.count} review{ratingSummary.count !== 1 ? 's' : ''})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-extrabold text-gray-900">
              {formatCurrency(effectivePrice)}
            </span>
            {discountPercent > 0 && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  {formatCurrency(product.price)}
                </span>
                <Badge variant="destructive">Save {discountPercent}%</Badge>
              </>
            )}
          </div>

          {/* Stock */}
          {isOutOfStock ? (
            <Badge variant="destructive" className="w-fit">Out of Stock</Badge>
          ) : product.stock <= 5 ? (
            <Badge variant="warning" className="w-fit">
              Only {product.stock} left in stock!
            </Badge>
          ) : (
            <Badge variant="success" className="w-fit">In Stock</Badge>
          )}

          {/* Description */}
          {product.description && (
            <div className="prose prose-sm text-gray-600 max-w-none">
              <p>{product.description}</p>
            </div>
          )}

          {/* Add to cart */}
          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              className="w-full"
              disabled={isOutOfStock}
              isLoading={isLoading}
              onClick={handleAddToCart}
            >
              {isInCart ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  View Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </>
              )}
            </Button>

            {isInCart && (
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={() => router.push('/checkout')}
              >
                Proceed to Checkout
              </Button>
            )}
          </div>

          {/* SKU */}
          {product.sku && (
            <p className="text-xs text-gray-400">SKU: {product.sku}</p>
          )}
        </div>
      </div>

      {/* Customer Reviews Section */}
      {reviews.length > 0 && (
        <div className="mt-16 border-t pt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            Customer Reviews
            <Badge variant="secondary">{reviews.length}</Badge>
          </h2>

          {/* Rating overview bar */}
          {ratingSummary && ratingSummary.count > 0 && (
            <div className="flex flex-col sm:flex-row gap-8 mb-8">
              <div className="flex flex-col items-center justify-center">
                <p className="text-4xl font-bold text-gray-900">{ratingSummary.avg.toFixed(1)}</p>
                <div className="flex gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${s <= Math.round(ratingSummary.avg) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">{ratingSummary.count} reviews</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingSummary.distribution[star] || 0;
                  const pct = ratingSummary.count > 0 ? (count / ratingSummary.count) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 w-6 text-right">{star}</span>
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`bg-yellow-400 h-2 rounded-full transition-all ${pctWidthClass(pct)}`}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Individual reviews */}
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700">
                    {review.reviewer_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">{review.reviewer_name}</p>
                    <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                    />
                  ))}
                </div>
                {review.comment && (
                  <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.description,
            image: product.images,
            sku: product.sku,
            offers: {
              '@type': 'Offer',
              price: effectivePrice,
              priceCurrency: 'PKR',
              availability:
                product.stock > 0
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/OutOfStock',
            },
          }),
        }}
      />

      {/* Mobile sticky Add to Cart */}
      {!isInCart && !isOutOfStock && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-white border-t border-gray-200 md:hidden shadow-2xl">
          <Button
            size="lg"
            className="w-full"
            isLoading={isLoading}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-5 w-5" />
            Add to Cart — {formatCurrency(effectivePrice)}
          </Button>
        </div>
      )}
    </div>
  );
}
