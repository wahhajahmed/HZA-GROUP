import { SITE_NAME } from '@/lib/constants'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
  description: `Learn more about ${SITE_NAME} — your trusted online fashion destination in Pakistan.`,
}

export default function AboutPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">About {SITE_NAME}</h1>
      <p className="text-muted-foreground text-lg mb-10">Your trusted online shopping destination</p>

      <div className="prose prose-gray max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-3">Our Story</h2>
          <p className="text-muted-foreground leading-relaxed">
            {SITE_NAME} was founded with a simple vision: to bring quality fashion and lifestyle products
            to every home in Pakistan. We believe that everyone deserves access to premium products at
            fair prices, with the convenience of doorstep delivery.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            We are committed to offering a curated selection of high-quality products while providing
            exceptional customer service. Our mission is to make online shopping in Pakistan simple,
            trustworthy, and enjoyable.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Why Choose Us?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose">
            {[
              { title: 'Quality Guaranteed', desc: 'Every product is carefully selected and quality checked before listing.' },
              { title: 'Fast Delivery', desc: 'We deliver across Pakistan with same-day dispatch on most orders.' },
              { title: 'Easy Returns', desc: '7-day return policy for all items. No questions asked.' },
              { title: 'Secure Payments', desc: 'Cash on delivery available with full order transparency.' },
            ].map((item) => (
              <div key={item.title} className="p-5 border rounded-xl bg-accent/30">
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
          <p className="text-muted-foreground">
            Have questions? Visit our{' '}
            <a href="/contact" className="text-primary underline">Contact page</a>{' '}
            or email us at{' '}
            <a href="mailto:hzagroups1@gmail.com" className="text-primary underline">
              hzagroups1@gmail.com
            </a>
            . We&apos;re here to help!
          </p>
        </section>
      </div>
    </div>
  )
}
