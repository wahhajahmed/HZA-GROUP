'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, X, MessageSquarePlus } from 'lucide-react';
import { getUnreviewedDeliveredOrders } from '@/services/order.service';
import type { Order } from '@/types';
import { useAuthStore } from '@/store/auth.store';

const DISMISS_KEY = 'review_reminder_dismissed';
const DISMISS_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export function ReviewReminderPopup() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Check if user dismissed recently
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const ts = parseInt(dismissed, 10);
      if (Date.now() - ts < DISMISS_EXPIRY_MS) return;
    }

    // Fetch unreviewed delivered orders
    getUnreviewedDeliveredOrders().then(({ data }) => {
      if (data && data.length > 0) {
        setOrders(data);
        // Small delay so the page loads first
        setTimeout(() => setVisible(true), 2000);
      }
    });
  }, [user]);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  if (!visible || orders.length === 0) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={handleDismiss}
      />

      {/* Popup */}
      <div className="fixed inset-x-4 bottom-4 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[420px] z-50 animate-in slide-in-from-bottom-4 fade-in duration-500">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-400 to-yellow-500 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <MessageSquarePlus className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Rate Your Experience!</h3>
                <p className="text-white/80 text-xs">
                  {orders.length === 1
                    ? 'You have 1 order awaiting your review'
                    : `You have ${orders.length} orders awaiting your review`}
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              aria-label="Dismiss review reminder"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* Orders list */}
          <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/review?token=${order.id}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-amber-50 border border-gray-100 hover:border-amber-200 transition-all group"
              >
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 transition-colors">
                  <Star className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    Order #{order.order_number}
                  </p>
                  <p className="text-xs text-gray-500">Tap to write a review</p>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className="w-3.5 h-3.5 text-gray-200 group-hover:text-amber-300 transition-colors"
                    />
                  ))}
                </div>
              </Link>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 pb-4 flex gap-2">
            <button
              onClick={handleDismiss}
              className="flex-1 text-sm text-gray-500 hover:text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Remind me later
            </button>
            <Link
              href="/orders"
              onClick={handleDismiss}
              className="flex-1 text-sm text-center bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg transition-colors font-semibold"
            >
              View All Orders
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
