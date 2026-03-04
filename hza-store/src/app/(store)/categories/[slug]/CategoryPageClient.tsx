'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import type { Category, Product } from '@/types';
import { getChildren, getDescendantIds } from '@/lib/category-tree';
import { getEffectivePrice } from '@/lib/utils';

interface Props {
  category: Category;
  ancestors: Category[];
  allCategories: Category[];
  children: Category[];
  productCounts: Record<string, number>;
  initialProducts: Product[];
  initialTotal: number;
  initialTotalPages: number;
  initialPage: number;
  filteredCategory: Category | null;
}

function ProductCard({ product }: { product: Product }) {
  const price = getEffectivePrice(product.price, product.discount_price);
  const hasDiscount = product.discount_price != null && product.discount_price < product.price;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group rounded-xl border border-gray-200 bg-white overflow-hidden hover:border-blue-300 hover:shadow-md transition-all"
    >
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <span className="text-3xl font-bold text-blue-200">{product.name.charAt(0)}</span>
          </div>
        )}
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            SALE
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2 transition-colors">
          {product.name}
        </h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-bold text-blue-600">Rs {price.toLocaleString()}</span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              Rs {product.price.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

interface SidebarNodeProps {
  cat: Category;
  allCategories: Category[];
  productCounts: Record<string, number>;
  activeSlug: string | null;
  baseCategorySlug: string;
  depth?: number;
}

function countDescendants(allCategories: Category[], catId: string, counts: Record<string, number>): number {
  const descs = getDescendantIds(allCategories, catId);
  return descs.reduce((sum, id) => sum + (counts[id] ?? 0), 0);
}

function SidebarNode({ cat, allCategories, productCounts, activeSlug, baseCategorySlug, depth = 0 }: SidebarNodeProps) {
  const children = getChildren(allCategories, cat.id);
  const [expanded, setExpanded] = useState(activeSlug === cat.slug || children.some(c => c.slug === activeSlug));
  const count = countDescendants(allCategories, cat.id, productCounts);
  const isActive = activeSlug === cat.slug;

  const depthPadding = ['pl-2', 'pl-6', 'pl-10', 'pl-14'];

  return (
    <div>
      <div
        className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm transition-colors ${depthPadding[depth] ?? 'pl-14'} ${
          isActive
            ? 'bg-blue-50 text-blue-700 font-semibold'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        {children.length > 0 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mr-0.5 text-gray-400 hover:text-gray-600 flex-shrink-0"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? '' : '-rotate-90'}`} />
          </button>
        )}
        <Link
          href={`/categories/${baseCategorySlug}?sub=${cat.slug}`}
          className="flex-1 flex items-center justify-between gap-1 min-w-0"
          prefetch={false}
        >
          <span className="truncate">{cat.name}</span>
          {count > 0 && (
            <span className={`text-xs rounded-full px-1.5 py-0.5 flex-shrink-0 ${
              isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
            }`}>{count}</span>
          )}
        </Link>
      </div>
      {expanded && children.length > 0 && (
        <div>
          {children.map((child) => (
            <SidebarNode
              key={child.id}
              cat={child}
              allCategories={allCategories}
              productCounts={productCounts}
              activeSlug={activeSlug}
              baseCategorySlug={baseCategorySlug}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryPageClient({
  category,
  ancestors,
  allCategories,
  children,
  productCounts,
  initialProducts,
  initialTotal,
  initialTotalPages,
  initialPage,
  filteredCategory,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [, startTransition] = useTransition();

  const activeSub = filteredCategory?.slug ?? null;
  const activeLabel = filteredCategory?.name ?? category.name;
  const page = initialPage;

  function clearFilter() {
    startTransition(() => router.push(`/categories/${category.slug}`, { scroll: false }));
  }

  function goPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    startTransition(() => router.push(`/categories/${category.slug}?${params.toString()}`, { scroll: false }));
  }

  const sidebarContent = (
    <div className="space-y-1">
      {/* "All" option */}
      <Link
        href={`/categories/${category.slug}`}
        prefetch={false}
        className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          !activeSub ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <span>All {category.name}</span>
        <span className={`text-xs rounded-full px-1.5 py-0.5 ${
          !activeSub ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
        }`}>{initialTotal}</span>
      </Link>

      {/* Children tree */}
      {children.map((child) => (
        <SidebarNode
          key={child.id}
          cat={child}
          allCategories={allCategories}
          productCounts={productCounts}
          activeSlug={activeSub}
          baseCategorySlug={category.slug}
        />
      ))}
    </div>
  );

  return (
    <div>
      {/* Full-width category cover banner */}
      {category.image_url && !filteredCategory && (
        <div className="relative w-full -mt-24 overflow-hidden">
          <Image
            src={category.image_url}
            alt={category.name}
            width={1920}
            height={600}
            className="w-full h-auto object-contain"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-10">
            <div className="container mx-auto max-w-7xl">
              <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-white drop-shadow-lg">{category.name}</h1>
              {category.description && (
                <p className="mt-1 sm:mt-2 text-white/80 text-xs sm:text-sm md:text-base max-w-2xl">{category.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
          <Link href="/categories" className="hover:text-blue-600">Categories</Link>
          {ancestors.slice(0, -1).map((anc) => (
            <span key={anc.id} className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
              <Link href={`/categories/${anc.slug}`} className="hover:text-blue-600">{anc.name}</Link>
            </span>
          ))}
          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="text-gray-900 font-medium">{category.name}</span>
          {filteredCategory && (
            <>
              <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="text-gray-900 font-medium">{filteredCategory.name}</span>
            </>
          )}
        </nav>

        {/* Category header (when no cover image or when sub-filter is active) */}
        {(!category.image_url || filteredCategory) && (
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{activeLabel}</h1>
                {category.description && !filteredCategory && (
                  <p className="mt-1 text-gray-500 text-sm">{category.description}</p>
                )}
              </div>
              {filteredCategory && (
                <button
                  onClick={clearFilter}
                  className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  {filteredCategory.name} <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Product count + active filter chip when banner is showing */}
        {category.image_url && !filteredCategory && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              {initialTotal} product{initialTotal !== 1 ? 's' : ''}
            </p>
          </div>
        )}
        {filteredCategory && (
          <div className="mb-4">
            <p className="text-sm text-gray-400">
              {initialTotal} product{initialTotal !== 1 ? 's' : ''}
            </p>
          </div>
        )}
        {!category.image_url && !filteredCategory && (
          <div className="mb-4">
            <p className="text-sm text-gray-400">
              {initialTotal} product{initialTotal !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        <div className="flex gap-6">
        {/* Sidebar — desktop */}
        {children.length > 0 && (
          <aside className="hidden md:block w-56 flex-shrink-0">
            <div className="sticky top-24 rounded-xl border bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Filter by
              </h2>
              {sidebarContent}
            </div>
          </aside>
        )}

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Mobile filter toggle */}
          {children.length > 0 && (
            <button
              className="md:hidden mb-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium shadow-sm"
              onClick={() => setSidebarOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
              {activeSub && <span className="ml-1 rounded-full bg-blue-600 text-white text-xs px-1.5 py-0.5">1</span>}
            </button>
          )}

          {/* Products grid */}
          {initialProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-5xl mb-4">📦</div>
              <h3 className="text-lg font-semibold text-gray-800">No products found</h3>
              <p className="text-sm text-gray-500 mt-1">Try a different filter or check back later.</p>
              {filteredCategory && (
                <button onClick={clearFilter} className="mt-4 text-sm text-blue-600 underline">
                  Clear filter
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {initialProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {initialTotalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {page > 1 && (
                <button
                  onClick={() => goPage(page - 1)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
              <span className="text-sm text-gray-500">Page {page} of {initialTotalPages}</span>
              {page < initialTotalPages && (
                <button
                  onClick={() => goPage(page + 1)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  Next
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative ml-auto w-72 max-w-full h-full bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold text-gray-900">Filter by</h2>
              <button onClick={() => setSidebarOpen(false)} aria-label="Close filters">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
