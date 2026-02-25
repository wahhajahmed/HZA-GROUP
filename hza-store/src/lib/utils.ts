import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes safely using clsx + tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in PKR
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date to readable string
 */
export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
}

/**
 * Format date with time
 */
export function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

/**
 * Generate a slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Truncate text to a given length
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '…';
}

/**
 * Get the effective price (discount or regular)
 */
export function getEffectivePrice(
  price: number,
  discountPrice: number | null
): number {
  if (discountPrice !== null && discountPrice < price) return discountPrice;
  return price;
}

/**
 * Calculate discount percentage
 */
export function getDiscountPercent(
  price: number,
  discountPrice: number | null
): number {
  if (!discountPrice || discountPrice >= price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
}

/**
 * Get the first product image or placeholder
 */
export function getProductImage(images: string[]): string {
  if (images.length > 0) return images[0];
  return '/images/product-placeholder.png';
}

/**
 * Build Supabase public storage URL
 */
export function getStorageUrl(
  bucket: string,
  path: string
): string {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${baseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * Debounce utility
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
