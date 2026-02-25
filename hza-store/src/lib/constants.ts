import type { OrderStatus } from '@/types';

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'HZA Group';
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const SUPABASE_BUCKETS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  AVATARS: 'avatars',
} as const;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  packed: 'bg-purple-100 text-purple-800',
  shipped: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-700',
};

export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

export const LOW_STOCK_THRESHOLD = 5;

export const DEFAULT_PAGE_SIZE = 12;
export const ADMIN_PAGE_SIZE = 20;

export const PAYMENT_METHODS = [
  { value: 'cash_on_delivery', label: 'Cash on Delivery' },
] as const;

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/categories', label: 'Categories' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

export const FOOTER_LINKS = {
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
  ],
  policies: [
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms & Conditions' },
    { href: '/return-policy', label: 'Return Policy' },
    { href: '/shipping-policy', label: 'Shipping Policy' },
  ],
};
