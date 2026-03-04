import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/services/product.service';
import { getProductReviews, getProductRatingSummary } from '@/services/review.service';
import { ProductDetailClient } from '@/features/products/ProductDetailClient';
import { SITE_NAME } from '@/lib/constants';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: product } = await getProductBySlug(slug);
  if (!product) return { title: 'Product Not Found' };

  return {
    title: product.meta_title ?? product.name,
    description:
      product.meta_description ??
      product.description ??
      `Buy ${product.name} at ${SITE_NAME}`,
    openGraph: {
      title: product.name,
      description: product.description ?? '',
      images: product.images.length > 0 ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const { data: product } = await getProductBySlug(slug);

  if (!product) notFound();

  // Fetch reviews and rating summary in parallel
  const [reviewsResult, summaryResult] = await Promise.all([
    getProductReviews(product.id),
    getProductRatingSummary(product.id),
  ]);

  return (
    <ProductDetailClient
      product={product}
      reviews={reviewsResult.data ?? []}
      ratingSummary={summaryResult.data ?? { avg: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }}
    />
  );
}
