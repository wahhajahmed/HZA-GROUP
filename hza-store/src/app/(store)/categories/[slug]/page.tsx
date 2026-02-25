import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategoryPageData } from '@/services/category.service';
import { Suspense } from 'react';
import CategoryPageClient from './CategoryPageClient';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sub?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await getCategoryPageData(slug, null);
  if (!data) return { title: 'Category Not Found' };
  const cat = data.category;
  return {
    title: cat.name,
    description: cat.description ?? `Shop ${cat.name} at HZA Group`,
    openGraph: {
      images: cat.image_url ? [cat.image_url] : [],
    },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageStr, sub } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? '1', 10));
  const subSlug = sub ?? null;

  const { data, error } = await getCategoryPageData(slug, subSlug, page);
  if (error || !data) notFound();

  return (
    <Suspense>
      <CategoryPageClient
        category={data.category}
        ancestors={data.ancestors}
        allCategories={data.allCategories}
        children={data.children}
        productCounts={data.productCounts}
        initialProducts={data.products.data}
        initialTotal={data.products.count}
        initialTotalPages={data.products.totalPages}
        initialPage={page}
        filteredCategory={data.filteredCategory}
      />
    </Suspense>
  );
}
