import type { Metadata } from 'next'

import { SITE_NAME } from '@/lib/constants'
import { ShieldCheck, Truck, RotateCcw, CreditCard, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us',
  description: `Learn more about ${SITE_NAME} — your trusted online fashion destination in Pakistan.`,
}

export default function AboutPage() {
  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-white pb-20">
      {/* Hero Section */}
      <section className="w-full bg-white/80 border-b border-slate-100 py-6 md:py-8 mb-8 md:mb-10">
        <div className="mx-auto w-full max-w-5xl px-6 sm:px-8 lg:px-12 flex flex-col items-center text-center">
          <div className="relative w-[60px] md:w-[80px] aspect-square mx-auto mb-3">
            <Image 
              src="/images/hza-logo.jpeg" 
              alt="HZA Group Logo" 
              fill 
              className="object-contain" 
            />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2 text-slate-900 tracking-tight">About {SITE_NAME}</h1>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">Your trusted online shopping destination</p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-6 sm:px-8 lg:px-12 space-y-14 md:space-y-20">
        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-semibold">Our Story</h2>
          <p className="text-muted-foreground leading-relaxed text-base">
            {SITE_NAME} was founded with a simple vision: to bring quality fashion and lifestyle products
            to every home in Pakistan. We believe that everyone deserves access to premium products at
            fair prices, with the convenience of doorstep delivery.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-semibold">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed text-base">
            We are committed to offering a curated selection of high-quality products while providing
            exceptional customer service. Our mission is to make online shopping in Pakistan simple,
            trustworthy, and enjoyable.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-semibold">Why Choose Us?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 not-prose">
            {/* Feature Cards with Icons */}
            <div className="flex items-start gap-4 p-5 border rounded-xl bg-accent/30 min-h-[120px]">
              <ShieldCheck className="h-7 w-7 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Quality Guaranteed</h3>
                <p className="text-sm text-muted-foreground">Every product is carefully selected and quality checked before listing.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 border rounded-xl bg-accent/30 min-h-[120px]">
              <Truck className="h-7 w-7 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Fast Delivery</h3>
                <p className="text-sm text-muted-foreground">We deliver across Pakistan with same-day dispatch on most orders.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 border rounded-xl bg-accent/30 min-h-[120px]">
              <RotateCcw className="h-7 w-7 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Easy Returns</h3>
                <p className="text-sm text-muted-foreground">7-day return policy for all items. No questions asked.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 border rounded-xl bg-accent/30 min-h-[120px]">
              <CreditCard className="h-7 w-7 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Secure Payments</h3>
                <p className="text-sm text-muted-foreground">Cash on delivery available with full order transparency.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-semibold">Contact Us</h2>
          <p className="text-muted-foreground">
            Have questions? Visit our{' '}
            <Link href="/contact" className="text-primary underline">Contact page</Link>{' '}
            or email us at{' '}
            <a href="mailto:hzagroups1@gmail.com" className="text-primary underline">
              hzagroups1@gmail.com
            </a>
            . We&apos;re here to help!
          </p>
        </section>

        {/* Call to Action */}
        <section className="text-center pt-8">
          <Link href="/categories" className="inline-block px-8 py-4 bg-primary text-white font-bold rounded-full shadow-lg hover:bg-primary-dark transition">
            Shop Now
          </Link>
        </section>
      </div>
    </div>
  );
}
