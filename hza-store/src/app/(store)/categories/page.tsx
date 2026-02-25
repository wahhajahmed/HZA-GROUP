import type { Metadata } from 'next';
import Image from 'next/image';
import { getCategories } from '@/services/category.service';
import Link from 'next/link';
import { ChevronRight, Grid } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { getRootCategories } from '@/lib/category-tree';

export const metadata: Metadata = {
  title: 'All Categories',
  description: 'Browse all product categories at HZA Group.',
};

export const revalidate = 3600;

export default async function CategoriesPage() {
  const { data: allCategories } = await getCategories();
  const categories = getRootCategories(allCategories ?? []);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 font-medium">Categories</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">All Categories</h1>

      {categories.length === 0 ? (
        <EmptyState
          icon={Grid}
          title="No categories yet"
          description="Check back soon for our product collections."
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group rounded-xl border border-gray-200 bg-white overflow-hidden hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="relative aspect-video bg-gray-100 overflow-hidden">
                {cat.image_url ? (
                  <Image
                    src={cat.image_url}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                    <span className="text-4xl font-bold text-blue-300">
                      {cat.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                    {cat.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
