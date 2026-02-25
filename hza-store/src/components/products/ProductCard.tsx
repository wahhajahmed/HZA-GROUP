'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Product } from '@/types';
import { formatCurrency, getEffectivePrice, getDiscountPercent, getProductImage } from '@/lib/utils';
import { addToCart } from '@/services/cart.service';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { items, addItem } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);

  const effectivePrice = getEffectivePrice(product.price, product.discount_price);
  const discountPercent = getDiscountPercent(product.price, product.discount_price);
  const isInCart = items.some((i) => i.product_id === product.id);
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please login to add items to cart');
      router.push('/login?next=/cart');
      return;
    }

    if (isInCart) {
      toast.info('Item already in your cart');
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
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={getProductImage(product.images)}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {discountPercent > 0 && (
            <Badge
              variant="destructive"
              className="absolute top-2 left-2 text-[10px]"
            >
              -{discountPercent}%
            </Badge>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                Out of Stock
              </span>
            </div>
          )}
          {product.is_featured && !isOutOfStock && (
            <Badge className="absolute top-2 right-2 text-[10px]">
              Featured
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-3 md:p-4 space-y-2">
          {product.category && (
            <p className="text-[11px] font-medium text-blue-600 uppercase tracking-wide">
              {product.category.name}
            </p>
          )}
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-gray-900">
              {formatCurrency(effectivePrice)}
            </span>
            {discountPercent > 0 && (
              <span className="text-xs text-gray-400 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          {/* Stock indicator */}
          {product.stock > 0 && product.stock <= 5 && (
            <p className="text-xs text-orange-500 font-medium">
              Only {product.stock} left!
            </p>
          )}

          {/* Add to cart */}
          <Button
            size="sm"
            className="w-full mt-1"
            variant={isInCart ? 'secondary' : 'default'}
            disabled={isOutOfStock}
            isLoading={isLoading}
            onClick={handleAddToCart}
          >
            {isInCart ? (
              <>
                <CheckCircle className="h-4 w-4" />
                In Cart
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </>
            )}
          </Button>
        </div>
      </div>
    </Link>
  );
}
