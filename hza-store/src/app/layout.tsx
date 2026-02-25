import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { CartProvider } from '@/components/providers/CartProvider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: `%s | ${process.env.NEXT_PUBLIC_SITE_NAME ?? 'HZA Group'}`,
    default: process.env.NEXT_PUBLIC_SITE_NAME ?? 'HZA Group',
  },
  description:
    'Your one-stop online store for quality products. Shop the latest collections with fast delivery across Pakistan.',
  keywords: ['online store', 'shopping', 'Pakistan', 'ecommerce'],
  openGraph: {
    type: 'website',
    siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? 'HZA Group',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
