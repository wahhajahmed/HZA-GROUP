import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/services/product.service';
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
    // Product structured data (JSON-LD injected in client component)
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const { data: product } = await getProductBySlug(slug);

  if (!product) notFound();

  return <ProductDetailClient product={product} />;
}
