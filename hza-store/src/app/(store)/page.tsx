import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Truck, RotateCcw, Shield, Headphones, Star } from 'lucide-react';
import { getFeaturedProducts } from '@/services/product.service';
import { getCategories } from '@/services/category.service';
import { getVisibleReviews } from '@/services/review.service';
import { getRootCategories } from '@/lib/category-tree';
import { createClient } from '@/lib/supabase/server';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ProductGridSkeleton } from '@/components/ui/skeleton';
import { ReviewsSlider } from '@/components/shared/ReviewsSlider';
import { Suspense } from 'react';

import { SITE_NAME } from '@/lib/constants';
import type { Review } from '@/types';
import { HeroBanner } from './HeroBanner';

export const metadata: Metadata = {
  title: `${SITE_NAME} — Premium Fashion & Quality Products`,
  description:
    'Experience the finest selection of quality products at HZA Group. Premium collections with fast delivery across Pakistan.',
};

export const dynamic = 'force-dynamic';


const FEATURES = [
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Swift doorstep delivery Pakistan-wide',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    description: '7-day seamless return protection',
  },
  {
    icon: Shield,
    title: 'Secure COD',
    description: 'Verified cash on delivery options',
  },
  {
    icon: Headphones,
    title: 'VIP Support',
    description: 'Dedicated assistance 24/7',
  },
];


// --- Features Bar ---
function FeaturesBar() {
  return (
    <section className="bg-white border-b border-slate-100">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-center gap-4 group">
              <div className="flex-shrink-0 h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center transition-all group-hover:bg-primary group-hover:border-primary">
                <f.icon className="h-6 w-6 text-slate-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 uppercase tracking-wide">{f.title}</p>
                <p className="text-xs text-slate-400 mt-1 font-medium">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


// --- Category Section ---
async function CategorySection() {
  const { data: allCategories } = await getCategories();
  const categories = getRootCategories(allCategories ?? []);
  if (!categories || categories.length === 0) return null;

  return (
    <section className="container mx-auto max-w-7xl px-4 py-16 md:py-20">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 md:mb-12 gap-6">
        <div className="space-y-2">
          <span className="text-primary font-bold text-[10px] md:text-xs uppercase tracking-[0.2em]">Curated Collections</span>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Shop by Category</h2>
        </div>
        <Link
          href="/categories"
          className="group flex items-center gap-2 text-xs md:text-sm font-bold text-slate-900 border-b-2 border-slate-900 pb-1 hover:text-primary hover:border-primary transition-all self-start md:self-auto"
        >
          Explore All Collections <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
      
      {/* Categories Grid/Slider */}
      <div className="flex md:grid md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-8 overflow-x-auto md:overflow-visible pb-4 md:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
        {categories.slice(0, 6).map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="flex-shrink-0 min-w-[70%] md:min-w-0 md:w-auto snap-start group flex flex-col items-center gap-4 bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition text-center border border-slate-100"
          >
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl shadow-inner bg-slate-50 flex items-center justify-center">
              {cat.image_url ? (
                <Image
                  src={cat.image_url}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="80px"
                />
              ) : (
                <span className="text-2xl font-black text-slate-200">{cat.name.charAt(0)}</span>
              )}
            </div>
            <span className="text-sm font-bold text-slate-800 tracking-tight group-hover:text-primary transition-colors">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

// --- Featured Products Section ---
async function FeaturedProductsSection() {
  const { data: products } = await getFeaturedProducts();
  return (
    <section className="container mx-auto max-w-7xl px-4 py-16 md:py-20 bg-slate-50/30">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 md:mb-12 gap-6">
        <div className="space-y-2">
          <span className="text-primary font-bold text-[10px] md:text-xs uppercase tracking-[0.2em]">Latest Arrivals</span>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Featured Products</h2>
        </div>
        <Link
          href="/categories"
          className="group flex items-center gap-2 text-xs md:text-sm font-bold text-slate-900 border-b-2 border-slate-900 pb-1 hover:text-primary hover:border-primary transition-all self-start md:self-auto"
        >
          View New Releases <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
      <ProductGrid products={products ?? []} />
    </section>
  );
}


// --- Testimonials & Call to Action ---
async function TestimonialsSection() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: reviews } = await getVisibleReviews();
  const dbReviews = reviews ?? [];

  const fallbackReviews = [
    { id: 'f1', reviewer_name: 'Ahmed Raza', comment: 'Amazing quality! The clothes fit perfectly and the delivery was super fast.', rating: 5 },
    { id: 'f2', reviewer_name: 'Fatima Khan', comment: 'Excellent service and beautiful products. Exactly like the pictures.', rating: 5 },
    { id: 'f3', reviewer_name: 'Usman Ali', comment: 'Very good experience. Prices are reasonable and quality is top-notch.', rating: 4 },
    { id: 'f4', reviewer_name: 'Ayesha Malik', comment: 'I am really impressed with the packaging and product quality. Highly recommended!', rating: 5 },
{ id: 'f5', reviewer_name: 'Bilal Hussain', comment: 'Delivery was on time and customer support was very helpful. Great experience overall.', rating: 4 },
{ id: 'f6', reviewer_name: 'Sana Ahmed', comment: 'The fabric quality is excellent and exactly as shown in the pictures. Will shop again.', rating: 5 },
{ id: 'f7', reviewer_name: 'Hassan Tariq', comment: 'Good value for money. The product quality exceeded my expectations.', rating: 4 },
  ] as Review[];

  const allReviews = dbReviews.length > 0 ? dbReviews : fallbackReviews;

  return (
    <section className="relative bg-slate-950 py-24 overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-4 relative z-10">
        <div className="grid lg:grid-cols-5 gap-16 items-center">
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white leading-[1.1] tracking-tighter">
                Loved by thousands of <span className="text-primary italic">happy</span> shoppers.
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Join our community of satisfied customers enjoying premium quality and exceptional Pakistani craftsmanship.
              </p>
            </div>
            <div className="flex items-center gap-8 border-t border-slate-800 pt-8">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white italic">4.9/7</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Global Rating</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white italic">10k+</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Happy Clients</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="glass-dark p-8 rounded-3xl border-slate-800">
              <ReviewsSlider reviews={allReviews} />
            </div>
          </div>
        </div>
        {!user && (
          <div className="mt-20 premium-card bg-indigo-600 border-0 p-12 text-center rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 space-y-6">
              <h3 className="text-3xl font-black text-white tracking-tight">Become an HZA Insider</h3>
              <p className="text-indigo-100 max-w-md mx-auto">Create an account today and unlock exclusive access to pre-launches and member-only rewards.</p>
              <div className="flex justify-center pt-4">
                <Link href="/signup" className="bg-white text-indigo-600 px-10 py-4 rounded-2xl font-black shadow-2xl shadow-indigo-900/40 hover:scale-105 transition-transform">
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}


export default async function HomePage() {
  /* Pre-fetch featured products for the hero slider */
  const { data: heroProducts } = await getFeaturedProducts();
  const sliderProducts = (heroProducts ?? []).slice(0, 6).map((p) => ({
    slug: p.slug,
    name: p.name,
    price: p.price,
    discount_price: p.discount_price,
    images: p.images,
  }));

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <HeroBanner featuredProducts={sliderProducts} />
      <FeaturesBar />
      <Suspense fallback={null}>
        <CategorySection />
      </Suspense>
      <Suspense fallback={<ProductGridSkeleton count={8} />}>
        <FeaturedProductsSection />
      </Suspense>
      <Suspense fallback={null}>
        <TestimonialsSection />
      </Suspense>
    </div>
  );
}
