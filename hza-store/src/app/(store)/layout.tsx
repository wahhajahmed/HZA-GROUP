import { Suspense } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import PromotionWrapper from '@/components/shared/PromotionWrapper';
import { ReviewReminderPopup } from '@/components/shared/ReviewReminderPopup';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-24">{children}</main>
      <Footer />
      {/* Promotions are loaded independently so they never block page render */}
      <Suspense fallback={null}>
        <PromotionWrapper />
      </Suspense>
      {/* Review reminder popup for delivered but unreviewed orders */}
      <ReviewReminderPopup />
    </div>
  );
}
