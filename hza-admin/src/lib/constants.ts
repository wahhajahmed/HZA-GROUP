export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'HZA Store';
export const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL ?? 'http://localhost:3000';

export const SUPABASE_BUCKETS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  AVATARS: 'avatars',
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export const ORDER_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'pending',    label: 'Pending' },
  { value: 'confirmed',  label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'packed',     label: 'Packed' },
  { value: 'shipped',    label: 'Shipped' },
  { value: 'delivered',  label: 'Delivered' },
  { value: 'cancelled',  label: 'Cancelled' },
  { value: 'refunded',   label: 'Refunded' },
];

export const QUERY_STATUS_LABELS: Record<string, string> = {
  open:    'Open',
  replied: 'Replied',
  closed:  'Closed',
};
