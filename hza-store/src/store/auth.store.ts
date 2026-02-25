import { create } from 'zustand';
import type { Profile } from '@/types';

interface AuthStore {
  user: Profile | null;
  isLoading: boolean;
  setUser: (user: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: false,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ isLoading: loading }),

  isAuthenticated: () => get().user !== null,
  isAdmin: () => get().user?.is_admin === true,
}));
