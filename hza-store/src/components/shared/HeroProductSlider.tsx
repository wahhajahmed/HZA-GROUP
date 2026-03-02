"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export interface SliderProduct {
  slug: string;
  name: string;
  price: number;
  discount_price: number | null;
  images: string[];
}

interface Props {
  products: SliderProduct[];
  /** Auto-advance interval in ms (default 3500) */
  interval?: number;
}

export function HeroProductSlider({ products, interval = 3500 }: Props) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const len = products.length;

  const advance = useCallback(() => {
    setActive((prev) => (prev + 1) % len);
  }, [len]);

  /* Auto-slide timer */
  useEffect(() => {
    if (paused || len <= 1) return;
    timerRef.current = setInterval(advance, interval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, advance, interval, len]);

  if (len === 0) return null;

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div
      className="relative w-full max-w-[500px] mx-auto select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      {/* Card */}
      <div className="relative aspect-[4/5] rounded-2xl md:rounded-3xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl shadow-black/30">
        {products.map((p, i) => {
          const imgSrc =
            p.images?.[0] ??
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'/%3E";

          return (
            <Link
              key={p.slug}
              href={`/products/${p.slug}`}
              aria-hidden={i !== active}
              tabIndex={i === active ? 0 : -1}
              className={`absolute inset-0 flex flex-col transition-opacity duration-700 ease-in-out ${
                i === active
                  ? "opacity-100 pointer-events-auto z-10"
                  : "opacity-0 pointer-events-none z-0"
              }`}
            >
              {/* Product image */}
              <div className="relative flex-1 min-h-0">
                <Image
                  src={imgSrc}
                  alt={p.name}
                  fill
                  sizes="(max-width: 1024px) 90vw, 500px"
                  className="object-contain p-4 md:p-6"
                  loading={i === 0 ? "eager" : "lazy"}
                />
              </div>

              {/* Info bar — name only */}
              <div className="relative z-20 px-5 py-4 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
                <p className="text-white font-bold text-sm md:text-base truncate leading-tight">
                  {p.name}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Dots */}
      {len > 1 && (
        <div className="flex justify-center gap-1.5 mt-4">
          {products.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === active
                  ? "w-6 bg-white"
                  : "w-1.5 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
