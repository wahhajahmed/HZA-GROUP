'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart.store';
import {
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
} from '@/services/cart.service';
import { formatCurrency, getEffectivePrice, getProductImage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';

export default function CartPage() {
  const router = useRouter();
  const { items, updateItem, removeItem, clearItems, subtotal } = useCartStore();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleQuantityChange = async (
    productId: string,
    quantity: number
  ) => {
    if (quantity < 1) return;
    setLoadingId(productId);
    const { error } = await updateCartItemQuantity(productId, quantity);
    setLoadingId(null);
    if (error) {
      toast.error(error);
    } else {
      updateItem(productId, quantity);
    }
  };

  const handleRemove = async (productId: string) => {
    setLoadingId(productId);
    const { error } = await removeFromCart(productId);
    setLoadingId(null);
    if (error) {
      toast.error(error);
    } else {
      removeItem(productId);
      toast.success('Item removed from cart');
    }
  };

  const handleClearCart = async () => {
    const { error } = await clearCart();
    if (error) {
      toast.error(error);
    } else {
      clearItems();
      toast.success('Cart cleared');
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Add products to your cart and they'll show up here."
          actionLabel="Continue Shopping"
          actionHref="/categories"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
        </h1>
        <button
          onClick={handleClearCart}
          className="text-sm text-red-500 hover:text-red-700 font-medium"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const product = item.product!;
            const price = getEffectivePrice(
              product.price,
              product.discount_price
            );
            const loading = loadingId === item.product_id;

            return (
              <div
                key={item.id}
                className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                {/* Image */}
                <Link
                  href={`/products/${product.slug}`}
                  className="flex-shrink-0"
                >
                  <div className="relative h-20 w-20 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                    <Image
                      src={getProductImage(product.images)}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                </Link>

                {/* Details */}
                <div className="flex flex-1 flex-col gap-2 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/products/${product.slug}`}
                      className="text-sm font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 leading-tight"
                    >
                      {product.name}
                    </Link>
                    <button
                      onClick={() => handleRemove(item.product_id)}
                      disabled={loading}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-sm font-bold text-gray-900">
                    {formatCurrency(price)}
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.product_id,
                            item.quantity - 1
                          )
                        }
                        disabled={loading || item.quantity <= 1}
                        aria-label="Decrease quantity"
                        className="flex h-8 w-8 items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="flex h-8 w-10 items-center justify-center text-sm font-semibold border-x border-gray-200">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.product_id,
                            item.quantity + 1
                          )
                        }
                        disabled={loading || item.quantity >= product.stock}
                        aria-label="Increase quantity"
                        className="flex h-8 w-8 items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="text-xs text-gray-400">
                      {product.stock} available
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-blue-600">
                    Subtotal: {formatCurrency(price * item.quantity)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Order Summary
            </h2>

            <div className="space-y-2.5 border-t border-gray-100 pt-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-500 line-clamp-1 pr-2">
                    {item.product?.name} × {item.quantity}
                  </span>
                  <span className="font-medium text-gray-900 flex-shrink-0">
                    {formatCurrency(
                      getEffectivePrice(
                        item.product!.price,
                        item.product!.discount_price
                      ) * item.quantity
                    )}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery</span>
                <span className="font-medium text-blue-600">Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-base font-bold border-t pt-2">
                <span>Total</span>
                <span>{formatCurrency(subtotal())}</span>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={() => router.push('/checkout')}
            >
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Link
              href="/categories"
              className="block text-center text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile sticky checkout */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 lg:hidden shadow-2xl z-40">
        <Button
          className="w-full"
          size="lg"
          onClick={() => router.push('/checkout')}
        >
          Checkout — {formatCurrency(subtotal())}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
