import { SITE_NAME } from '@/lib/constants'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Privacy policy for ${SITE_NAME}`,
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground mb-10">Last updated: January 1, 2025</p>

      <div className="space-y-8 text-sm leading-relaxed">
        {[
          {
            title: '1. Information We Collect',
            content: `We collect information you provide directly to us when you create an account, place an order, or contact us. This includes your name, email address, phone number, shipping address, and order history. We also automatically collect certain information when you use our website, including log data and device information.`,
          },
          {
            title: '2. How We Use Your Information',
            content: `We use the information we collect to process your orders and payments, communicate with you about your orders, send you promotional materials (with your consent), improve our website and services, and prevent fraud and ensure security.`,
          },
          {
            title: '3. Information Sharing',
            content: `We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties except to trusted third parties who assist us in operating our website, conducting our business, or servicing you — as long as those parties agree to keep this information confidential.`,
          },
          {
            title: '4. Data Security',
            content: `We implement a variety of security measures to maintain the safety of your personal information. Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems.`,
          },
          {
            title: '5. Cookies',
            content: `We use cookies to understand and save your preferences for future visits, keep track of advertisements, and compile aggregate data about site traffic and site interaction so that we can offer better site experiences and tools in the future.`,
          },
          {
            title: '6. Your Rights',
            content: `You have the right to access, update, or delete the personal information we have on you. You can do this by logging into your account or contacting us directly. You also have the right to opt-out of any marketing communications.`,
          },
          {
            title: '7. Contact Us',
            content: `If you have any questions about this Privacy Policy, please contact us at support@hzastore.com.`,
          },
        ].map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold mb-2">{section.title}</h2>
            <p className="text-muted-foreground">{section.content}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
