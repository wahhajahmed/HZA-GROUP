import type { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Package } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No products found"
        description="Check back later or browse other categories."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
