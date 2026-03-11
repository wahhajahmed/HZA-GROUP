import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types';
import { getEffectivePrice } from '@/lib/utils';

/** Match a cart item by its composite key: product + variant selection */
function matchItem(
  item: CartItem,
  productId: string,
  selectedColor?: string | null,
  selectedSize?: string | null,
) {
  return (
    item.product_id === productId &&
    (item.selected_color ?? null) === (selectedColor ?? null) &&
    (item.selected_size  ?? null) === (selectedSize  ?? null)
  );
}

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  // Actions
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  updateItem: (productId: string, quantity: number, selectedColor?: string | null, selectedSize?: string | null) => void;
  removeItem: (productId: string, selectedColor?: string | null, selectedSize?: string | null) => void;
  clearItems: () => void;
  setLoading: (loading: boolean) => void;
  // Computed
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      setItems: (items) => set({ items }),

      addItem: (item) =>
        set((state) => {
          const exists = state.items.find((i) =>
            matchItem(i, item.product_id, item.selected_color, item.selected_size)
          );
          if (exists) return state;
          return { items: [...state.items, item] };
        }),

      updateItem: (productId, quantity, selectedColor, selectedSize) =>
        set((state) => ({
          items: state.items.map((item) =>
            matchItem(item, productId, selectedColor, selectedSize)
              ? { ...item, quantity }
              : item
          ),
        })),

      removeItem: (productId, selectedColor, selectedSize) =>
        set((state) => ({
          items: state.items.filter(
            (item) => !matchItem(item, productId, selectedColor, selectedSize)
          ),
        })),

      clearItems: () => set({ items: [] }),

      setLoading: (loading) => set({ isLoading: loading }),

      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, item) => {
          const price = getEffectivePrice(
            item.product?.price ?? 0,
            item.product?.discount_price ?? null
          );
          return sum + price * item.quantity;
        }, 0),
    }),
    {
      name: 'hza-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
