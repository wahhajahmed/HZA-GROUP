import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types';
import { getEffectivePrice } from '@/lib/utils';

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  // Actions
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  updateItem: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
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
          const exists = state.items.find(
            (i) => i.product_id === item.product_id
          );
          if (exists) return state;
          return { items: [...state.items, item] };
        }),

      updateItem: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.product_id === productId ? { ...item, quantity } : item
          ),
        })),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.product_id !== productId),
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
      // Only persist a minimal snapshot for UI speed
      partialize: (state) => ({ items: state.items }),
    }
  )
);
