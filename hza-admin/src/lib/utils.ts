import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
}

// ── Pakistani phone number helpers ────────────────────────────────
/** Accepts +923XXXXXXXXX  923XXXXXXXXX  03XXXXXXXXX */
export const PK_PHONE_REGEX = /^(?:\+92|92|0)3[0-9]{9}$/;

/** Normalise any valid Pakistani mobile format → 03XXXXXXXXX. Returns null if invalid. */
export function normalizePakistaniPhone(raw: string): string | null {
  const cleaned = raw.replace(/[\s\-()]/g, '');
  if (!PK_PHONE_REGEX.test(cleaned)) return null;
  if (cleaned.startsWith('+92')) return '0' + cleaned.slice(3);
  if (cleaned.startsWith('92'))  return '0' + cleaned.slice(2);
  return cleaned;
}

export function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

export function slugify(text: string): string {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getEffectivePrice(price: number, discountPrice: number | null): number {
  if (discountPrice !== null && discountPrice < price) return discountPrice;
  return price;
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '…';
}
