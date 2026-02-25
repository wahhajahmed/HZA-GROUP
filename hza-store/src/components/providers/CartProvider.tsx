'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { getCart } from '@/services/cart.service';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { setItems } = useCartStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      // Sync cart from database when user logs in
      getCart().then(({ data }) => {
        if (data) setItems(data);
      });
    } else {
      // Clear local cart when user logs out
      setItems([]);
    }
  }, [user, setItems]);

  return <>{children}</>;
}
