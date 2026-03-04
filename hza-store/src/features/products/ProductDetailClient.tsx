'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  ChevronRight,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/types';
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

interface Props {
  product: Product;
}

export function ProductDetailClient({ product }: Props) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { items, addItem } = useCartStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

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

  const images = product.images.length > 0 ? product.images : ['/images/product-placeholder.png'];

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
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
            <Image
              src={images[selectedImage]}
              alt={product.name}
              fill
              className="object-contain p-4"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {discountPercent > 0 && (
              <Badge variant="destructive" className="absolute top-3 left-3">
                -{discountPercent}%
              </Badge>
            )}
          </div>
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
