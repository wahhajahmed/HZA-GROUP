import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Truck, RotateCcw, Shield, Headphones, Quote } from 'lucide-react';
import { getFeaturedProducts } from '@/services/product.service';
import { getCategories } from '@/services/category.service';
import { getVisibleReviews } from '@/services/review.service';
import { getRootCategories } from '@/lib/category-tree';
import { createClient } from '@/lib/supabase/server';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ProductGridSkeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ReviewsSlider } from '@/components/shared/ReviewsSlider';
import { Suspense } from 'react';

import { HeroBanner } from './HeroBanner';
import { SITE_NAME } from '@/lib/constants';
import type { Review } from '@/types';

export const metadata: Metadata = {
  title: `${SITE_NAME} — Shop Quality Products`,
  description:
    'Shop the latest collections at HZA Group. Quality products with fast delivery across Pakistan.',
};

// Cache featured products for 1 hour
export const dynamic = 'force-dynamic';

const FEATURES = [
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Delivered to your doorstep across Pakistan',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    description: '7-day hassle-free return policy',
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: 'Cash on Delivery - pay when you receive',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'We\'re here to help whenever you need us',
  },
];

async function FeaturedProducts() {
  const { data: products } = await getFeaturedProducts();
  return <ProductGrid products={products ?? []} />;
}

async function CategorySection() {
  const { data: allCategories } = await getCategories();
  const categories = getRootCategories(allCategories ?? []);
  if (!categories || categories.length === 0) return null;

  return (
    <section className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
        <Link
          href="/categories"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View All <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {categories.slice(0, 6).map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="group flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-center hover:border-blue-300 hover:shadow-sm transition-all"
          >
            {cat.image_url ? (
              <div className="relative h-12 w-12 overflow-hidden rounded-full">
                <Image
                  src={cat.image_url}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform"
                  sizes="48px"
                />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xl">{cat.name.charAt(0)}</span>
              </div>
            )}
            <span className="text-sm font-medium text-gray-700 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

async function BottomSection() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Not logged in → show CTA
    return (
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-14">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Start Shopping Today
          </h2>
          <p className="text-blue-100 mb-6">
            Create your account and enjoy exclusive deals
          </p>
          <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold">
            <Link href="/signup">Create Free Account</Link>
          </Button>
        </div>
      </section>
    );
  }

  // Logged in → show reviews slider
  const { data: reviews } = await getVisibleReviews();
  const dbReviews = reviews ?? [];

  // Fallback seed reviews shown when DB is empty (before patch is applied)
  const fallbackReviews = [
    { id: 'f1', user_id: '', order_id: '', rating: 5, reviewer_name: 'Ahmed Raza', comment: 'Amazing quality! The clothes fit perfectly and the delivery was super fast. Will definitely order again.', is_visible: true, is_seeded: true, created_at: '' },
    { id: 'f2', user_id: '', order_id: '', rating: 5, reviewer_name: 'Fatima Khan', comment: 'Excellent service and beautiful products. The packaging was neat and the product looks exactly like the pictures.', is_visible: true, is_seeded: true, created_at: '' },
    { id: 'f3', user_id: '', order_id: '', rating: 4, reviewer_name: 'Usman Ali', comment: 'Very good experience. Prices are reasonable and quality is top-notch. Highly recommend HZA Group to everyone.', is_visible: true, is_seeded: true, created_at: '' },
    { id: 'f4', user_id: '', order_id: '', rating: 5, reviewer_name: 'Ayesha Malik', comment: 'I ordered kids wear and my children love it! Soft fabric and great colors. Customer support was also very helpful.', is_visible: true, is_seeded: true, created_at: '' },
    { id: 'f5', user_id: '', order_id: '', rating: 5, reviewer_name: 'Bilal Hussain', comment: 'Fast COD delivery, product quality is excellent. The men\'s collection is really stylish. 10/10 would order again!', is_visible: true, is_seeded: true, created_at: '' },
    { id: 'f6', user_id: '', order_id: '', rating: 4, reviewer_name: 'Sana Tariq', comment: 'Great value for money. The women\'s dresses are beautiful. Packaging was secure and delivery was on time.', is_visible: true, is_seeded: true, created_at: '' },
    { id: 'f7', user_id: '', order_id: '', rating: 5, reviewer_name: 'Zain ul Abideen', comment: 'HZA Group never disappoints! Every order has been perfect. The fabric quality is outstanding and prices are fair.', is_visible: true, is_seeded: true, created_at: '' },
  ] as Review[];

  const allReviews = dbReviews.length > 0 ? dbReviews : fallbackReviews;

  return (
    <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-14">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Left: heading */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Quote className="h-6 w-6 text-yellow-400" />
              <span className="text-yellow-400 font-semibold text-sm uppercase tracking-wide">
                Customer Reviews
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
              What Our Customers Are Saying
            </h2>
            <p className="text-blue-100 text-base leading-relaxed mb-6">
              Thousands of happy customers across Pakistan trust HZA Group for quality products and reliable delivery.
            </p>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-extrabold text-white">4.7</p>
                <div className="flex gap-0.5 justify-center my-1">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} className={`h-4 w-4 ${i <= 4 ? 'text-yellow-400' : 'text-white/30'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-blue-200 text-xs">Average Rating</p>
              </div>
            </div>
          </div>

          {/* Right: vertical scrolling cards */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10">
            <ReviewsSlider reviews={allReviews} />
            {/* Gradient masks top/bottom */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-blue-700/80 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-indigo-800/80 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      {/* Modern Hero Banner */}
      <HeroBanner />

      {/* Features */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <f.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{f.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <Suspense fallback={null}>
        <CategorySection />
      </Suspense>

      {/* Featured Products */}
      <section className="container mx-auto max-w-7xl px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <Link
            href="/categories"
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <Suspense fallback={<ProductGridSkeleton count={8} />}>
          <FeaturedProducts />
        </Suspense>
      </section>

      {/* CTA or Reviews — depends on login status */}
      <Suspense fallback={null}>
        <BottomSection />
      </Suspense>
    </>
  );
}
