import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
}

export default function TermsPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-muted-foreground mb-10">Last updated: January 1, 2025</p>

      <div className="space-y-8 text-sm leading-relaxed">
        {[
          {
            title: '1. Acceptance of Terms',
            content: 'By accessing and using HZA Group, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.',
          },
          {
            title: '2. Use of the Service',
            content: 'You may use our service only for lawful purposes. You agree not to use the service in any way that violates any applicable local, national, or international law or regulation, or to transmit any unsolicited or unauthorized advertising material.',
          },
          {
            title: '3. Account Registration',
            content: 'To access certain features of our website, you may be required to register for an account. You must provide accurate, current, and complete information during the registration process and keep your account information updated.',
          },
          {
            title: '4. Orders and Payments',
            content: 'When you place an order, you are making an offer to purchase the product(s) listed. We reserve the right to accept or decline your order for any reason. We currently accept Cash on Delivery (COD) as our payment method.',
          },
          {
            title: '5. Pricing',
            content: 'All prices listed on our website are in Pakistani Rupees (PKR) and are inclusive of applicable taxes. We reserve the right to change prices at any time without notice. However, orders placed before a price change will be honored at the original price.',
          },
          {
            title: '6. Shipping and Delivery',
            content: 'We aim to deliver all orders within 3-7 business days. Delivery timelines may vary depending on your location. We are not responsible for delays caused by third-party couriers or unforeseen circumstances.',
          },
          {
            title: '7. Intellectual Property',
            content: 'The content, organization, graphics, design, and other matters related to the site are protected under applicable copyrights and other proprietary laws. Copying, redistribution, use, or publication of any such content is strictly prohibited.',
          },
          {
            title: '8. Limitation of Liability',
            content: 'HZA Group shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service or inability to use the service.',
          },
          {
            title: '9. Changes to Terms',
            content: 'We reserve the right to modify these terms at any time. We will notify users of any significant changes via email or a prominent notice on our website. Your continued use of the service after such modifications constitutes your acceptance of the new terms.',
          },
          {
            title: '10. Contact',
            content: 'For questions about these terms, please contact us at support@hzastore.com.',
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
