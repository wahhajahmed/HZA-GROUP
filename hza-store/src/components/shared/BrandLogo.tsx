import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  asLink?: boolean;
  href?: string;
  /** 'light' = white/light surface  |  'dark' = dark background */
  variant?: 'light' | 'dark';
  /** Controls rendered height. Width scales automatically from aspect ratio. */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/** CSS height class per size token */
const HEIGHT_CLS = { sm: 'h-8', md: 'h-11', lg: 'h-14' } as const;

/**
 * BrandLogo — reusable HZA logo component for the storefront.
 *
 * Height-driven: the image fills its declared height and the width scales
 * naturally from the intrinsic aspect ratio — so it never overflows the navbar.
 *
 * Light variant → mix-blend-mode: multiply — blends the JPEG white bg away
 *                 on white/gray surfaces (navbar, footer, auth cards).
 * Dark variant  → wrapped in a white rounded pill so the full-colour logo
 *                 stays crisp on dark headers (same pattern used by Shopify,
 *                 Vercel etc. for colour logos on dark chrome).
 */
export function BrandLogo({
  asLink = true,
  href = '/',
  variant = 'light',
  size = 'md',
  className,
}: BrandLogoProps) {
  const hCls = HEIGHT_CLS[size];

  const imgEl = (
    <Image
      src="/images/hza-logo.jpeg"
      alt="HZA Group"
      width={300}
      height={200}
      priority
      draggable={false}
      className={cn(
        // Height-driven: explicit height, auto width preserves aspect ratio
        hCls, 'w-auto',
        'block select-none object-contain',
        variant === 'light' && '[mix-blend-mode:multiply]',
      )}
    />
  );

  // On dark surfaces: wrap in a white pill so the colour logo reads cleanly
  const img = variant === 'dark' ? (
    <span className={cn('inline-flex items-center rounded-lg bg-white px-2 py-1', className)}>
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
      aria-label="HZA Group — Home"
      className="inline-flex shrink-0 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
    >
      {img}
    </Link>
  );
}
