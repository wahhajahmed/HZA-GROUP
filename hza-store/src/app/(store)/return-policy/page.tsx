import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Return & Refund Policy',
}

export default function ReturnPolicyPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-2">Return & Refund Policy</h1>
      <p className="text-muted-foreground mb-10">Last updated: January 1, 2025</p>

      <div className="mb-8 p-5 bg-green-50 border border-green-200 rounded-xl">
        <p className="font-semibold text-green-800 text-lg">7-Day Return Policy</p>
        <p className="text-green-700 text-sm mt-1">
          We accept returns within 7 days of delivery for eligible items.
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed">
        {[
          {
            title: 'Eligible Items for Return',
            content: 'Items can be returned if they are unused, unwashed, in original condition with all tags attached, in original packaging, and accompanied by proof of purchase (order number).',
          },
          {
            title: 'Non-Returnable Items',
            content: 'The following items cannot be returned: sale/clearance items, items marked as "final sale", used or washed items, items without original tags or packaging, customized or personalized items.',
          },
          {
            title: 'How to Initiate a Return',
            content: 'To start a return, contact us at support@hzastore.com with your order number and reason for return. We will provide you with return instructions and a return authorization number within 24 hours.',
          },
          {
            title: 'Refund Process',
            content: 'Since we use Cash on Delivery, refunds are processed via bank transfer. Once we receive and inspect the returned item, we will initiate the refund within 3-5 business days. Please ensure you provide your bank details when requesting a return.',
          },
          {
            title: 'Damaged or Defective Items',
            content: 'If you receive a damaged or defective item, please contact us within 48 hours of delivery with photos. We will arrange a free replacement or full refund at no additional cost to you.',
          },
          {
            title: 'Return Shipping',
            content: 'You are responsible for return shipping costs unless the item is defective or we made an error. We recommend using a trackable shipping service for returns.',
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
