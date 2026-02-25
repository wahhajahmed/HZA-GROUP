import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  asLink?: boolean;
  href?: string;
  /** 'dark' = dark sidebar  |  'light' = light surface (login card, mobile bar) */
  variant?: 'light' | 'dark';
  /** Controls rendered height. Width scales automatically from aspect ratio. */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/** CSS height class per size token */
const HEIGHT_CLS = { sm: 'h-7', md: 'h-9', lg: 'h-12' } as const;

/**
 * BrandLogo — reusable HZA logo component for the admin dashboard.
 *
 * Height-driven sizing so the logo never overflows its container.
 *
 * Dark variant  → displayed inside a white rounded pill so the full-colour
 *                 JPEG logo reads clearly on the gray-900 sidebar.
 * Light variant → mix-blend-mode: multiply strips the white JPEG background
 *                 on white/gray surfaces (login card, mobile top bar).
 */
export function BrandLogo({
  asLink = true,
  href = '/dashboard',
  variant = 'dark',
  size = 'md',
  className,
}: BrandLogoProps) {

  const hCls = HEIGHT_CLS[size];
  const imgEl = (
    <Image
      src="/images/hza-logo.jpeg"
      alt="HZA Group Logo"
      width={300}
      height={120}
      priority
      draggable={false}
      className={cn(
        hCls,
        'w-auto',
        'block select-none object-contain',
        'max-h-[65px]',
        'image-rendering-auto',
        variant === 'light' && '[mix-blend-mode:multiply]',
      )}
      style={{ maxHeight: 65, width: 'auto', objectFit: 'contain', background: 'none', display: 'block' }}
      sizes="(max-width: 768px) 120px, (max-width: 1200px) 160px, 180px"
    />
  );

  // On dark sidebar: wrap in white pill — colour logo on dark chrome
  const img = variant === 'dark' ? (
    <span className={cn('inline-flex items-center rounded-lg bg-white px-2.5 py-1', className)}>
      {imgEl}
    </span>
  ) : (
    <span className={cn('inline-flex items-center overflow-hidden', className)}>
      {imgEl}
    </span>
  );

  if (!asLink) return img;

  return (
    <Link
      href={href}
      aria-label="HZA Admin — Dashboard"
      className="inline-flex shrink-0 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
    >
      {img}
    </Link>
  );
}
