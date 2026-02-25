'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Clock } from 'lucide-react';
import type { Promotion } from '@/types';

// ─────────────────────────────────────────────
// Confetti
// ─────────────────────────────────────────────
const CONFETTI_COLORS = [
  '#f59e0b', '#ef4444', '#3b82f6', '#10b981',
  '#8b5cf6', '#ec4899', '#f97316', '#06b6d4',
];

// Pre-generated deterministic confetti particles (module-level — not in render)
const CONFETTI_PARTICLES = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  left: `${(i * 31 + 7) % 97}%`,
  size: `${6 + (i % 8)}px`,
  delay: `${((i * 17) % 21) / 10}s`,
  duration: `${3 + (i % 31) / 10}s`,
  rotate: (i * 37) % 360,
  shape: i % 3 === 0 ? 'rounded-full' : i % 3 === 1 ? 'rounded-sm' : '',
}));

function Confetti() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[200] overflow-hidden">
      <style>{CONFETTI_PARTICLES.map((c) => `.cp-${c.id}{left:${c.left};top:-20px;width:${c.size};height:${c.size};background-color:${c.color};animation-delay:${c.delay};animation-duration:${c.duration};transform:rotate(${c.rotate}deg)}`).join('')}</style>
      {CONFETTI_PARTICLES.map((p) => (
        <div
          key={p.id}
          className={`absolute cp-${p.id} ${p.shape} animate-confetti-fall`}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Countdown
// ─────────────────────────────────────────────
function useCountdown(endDatetime: string | null) {
  const [remaining, setRemaining] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!endDatetime) return;

    function tick() {
      const diff = new Date(endDatetime!).getTime() - Date.now();
      if (diff <= 0) {
        setExpired(true);
        setRemaining(null);
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setRemaining(d > 0 ? `${d}d ${h}:${m}:${s}` : `${h}:${m}:${s}`);
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDatetime]);

  return { remaining, expired };
}

// ─────────────────────────────────────────────
// Frequency check helpers
// ─────────────────────────────────────────────
function getStorageKey(id: string, frequency: string) {
  if (frequency === 'daily') {
    const today = new Date().toISOString().slice(0, 10);
    return `hza_promo_${id}_${today}`;
  }
  return `hza_promo_${id}`;
}

function shouldShow(id: string, frequency: string): boolean {
  if (frequency === 'always') return true;
  const key = getStorageKey(id, frequency);
  const storage = frequency === 'session' ? sessionStorage : localStorage;
  return !storage.getItem(key);
}

function markShown(id: string, frequency: string) {
  if (frequency === 'always') return;
  const key = getStorageKey(id, frequency);
  const storage = frequency === 'session' ? sessionStorage : localStorage;
  storage.setItem(key, '1');
}

// ─────────────────────────────────────────────
// Main PromotionBanner
// ─────────────────────────────────────────────
interface PromotionBannerProps {
  promotion: Promotion;
}

export default function PromotionBanner({ promotion: p }: PromotionBannerProps) {
  const [visible, setVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [entering, setEntering] = useState(true);
  const shownRef = useRef(false);

  const { remaining, expired } = useCountdown(p.end_datetime);

  // Auto-hide when countdown expires (scheduled via setTimeout to avoid sync setState-in-effect)
  useEffect(() => {
    if (!expired) return;
    const t = setTimeout(() => setVisible(false), 0);
    return () => clearTimeout(t);
  }, [expired]);

  // Delay show by 800ms, check frequency
  useEffect(() => {
    if (shownRef.current) return;
    shownRef.current = true;

    const timer = setTimeout(() => {
      if (!shouldShow(p.id, p.show_frequency)) return;
      setVisible(true);
      markShown(p.id, p.show_frequency);

      if (p.celebration_mode) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 7000);
      }

      // Trigger enter animation
      setTimeout(() => setEntering(false), 50);
    }, 800);

    return () => clearTimeout(timer);
  }, [p.id, p.show_frequency, p.celebration_mode]);

  function close() {
    setEntering(true);
    setTimeout(() => setVisible(false), 300);
  }

  if (!visible) return null;

  const isModal = p.display_mode === 'popup';
  const bg = p.bg_color ?? '#2563eb';

  // ── MODAL POPUP ──
  if (isModal) {
    return (
      <>
        <style>{`.promo-bg{background-color:${bg}}.promo-text{color:${bg}}`}</style>
        {showConfetti && <Confetti />}
        {/* Overlay */}
        <div
          className={`fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${entering ? 'opacity-0' : 'opacity-100'}`}
          onClick={close}
        />
        {/* Modal */}
        <div
          className={`fixed inset-0 z-[160] flex items-center justify-center p-4 pointer-events-none`}
        >
          <div
            className={`pointer-events-auto w-full max-w-md rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 promo-bg ${entering ? 'opacity-0 scale-90 translate-y-4' : 'opacity-100 scale-100 translate-y-0'}`}
          >
            {/* Close */}
            <div className="flex justify-end p-3">
              <button
                onClick={close}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Banner Image */}
            {p.image_url && (
              <div className="relative w-full h-44 mx-auto">
                <Image src={p.image_url} alt={p.title} fill className="object-cover" />
              </div>
            )}

            {/* Content */}
            <div className="px-6 pb-6 pt-4 text-center text-white">
              <h2 className="text-2xl font-extrabold leading-tight mb-2">{p.title}</h2>
              {p.description && (
                <p className="text-white/85 text-sm leading-relaxed mb-4">{p.description}</p>
              )}

              {/* Countdown */}
              {remaining && (
                <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-white text-sm font-mono font-semibold mb-4">
                  <Clock className="h-3.5 w-3.5" />
                  Offer Ends In: {remaining}
                </div>
              )}

              {/* CTA */}
              {p.button_text && (
                p.redirect_url ? (
                  <Link
                    href={p.redirect_url}
                    onClick={close}
                    className="inline-block w-full bg-white font-semibold rounded-xl py-3 text-sm transition-opacity hover:opacity-90 promo-text"
                  >
                    {p.button_text}
                  </Link>
                ) : (
                  <button
                    onClick={close}
                    className="w-full bg-white font-semibold rounded-xl py-3 text-sm transition-opacity hover:opacity-90 promo-text"
                  >
                    {p.button_text}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── SLIDE-IN BANNER (bottom-right) ──
  return (
    <>
      <style>{`.promo-bg{background-color:${bg}}.promo-text{color:${bg}}`}</style>
      {showConfetti && <Confetti />}
      <div
        className={`fixed bottom-5 right-5 z-[150] w-80 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 promo-bg ${entering ? 'opacity-0 translate-x-16 translate-y-4' : 'opacity-100 translate-x-0 translate-y-0'}`}
      >
        {/* Close */}
        <div className="flex justify-between items-start p-4 pb-0">
          <span className="text-white/70 text-xs font-semibold uppercase tracking-wide">
            Promotion
          </span>
          <button
            onClick={close}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Banner Image */}
        {p.image_url && (
          <div className="relative w-full h-32">
            <Image src={p.image_url} alt={p.title} fill className="object-cover" />
          </div>
        )}

        {/* Content */}
        <div className="px-4 py-3 text-white">
          <h3 className="font-bold text-base leading-tight mb-1">{p.title}</h3>
          {p.description && (
            <p className="text-white/80 text-xs leading-relaxed mb-2 line-clamp-2">
              {p.description}
            </p>
          )}

          {/* Countdown */}
          {remaining && (
            <div className="flex items-center gap-1.5 text-white/90 text-xs font-mono font-semibold mb-3">
              <Clock className="h-3 w-3" />
              {remaining}
            </div>
          )}

          {/* CTA */}
          {p.button_text && (
            p.redirect_url ? (
              <Link
                href={p.redirect_url}
                onClick={close}
                className="inline-block w-full bg-white text-center font-semibold rounded-lg py-2 text-xs transition-opacity hover:opacity-90 promo-text"
              >
                {p.button_text}
              </Link>
            ) : (
              <button
                onClick={close}
                className="w-full bg-white font-semibold rounded-lg py-2 text-xs transition-opacity hover:opacity-90 promo-text"
              >
                {p.button_text}
              </button>
            )
          )}
        </div>
      </div>
    </>
  );
}
