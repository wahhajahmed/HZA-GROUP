import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shipping Policy',
}

export default function ShippingPolicyPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-2">Shipping Policy</h1>
      <p className="text-muted-foreground mb-10">Last updated: January 1, 2025</p>

      {/* Delivery Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { title: 'Same-Day Dispatch', desc: 'Orders placed before 2 PM are dispatched the same day' },
          { title: '3-7 Business Days', desc: 'Standard delivery time across Pakistan' },
          { title: 'Cash on Delivery', desc: 'Pay when your order arrives at your door' },
        ].map((card) => (
          <div key={card.title} className="p-4 border rounded-xl text-center">
            <p className="font-semibold">{card.title}</p>
            <p className="text-sm text-muted-foreground mt-1">{card.desc}</p>
          </div>
        ))}
      </div>

      <div className="space-y-8 text-sm leading-relaxed">
        {[
          {
            title: 'Delivery Coverage',
            content: 'We deliver to major cities across Pakistan including Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, and many more. Delivery charges and timelines vary by city.',
          },
          {
            title: 'Delivery Charges',
            content: 'Delivery charges are calculated based on your city and are displayed at checkout before you place your order. Some cities may qualify for free delivery based on our current promotions.',
          },
          {
            title: 'Processing Time',
            content: 'Orders are processed Monday through Saturday, 9:00 AM to 6:00 PM. Orders placed after 2 PM or on Sundays/holidays will be processed the next business day.',
          },
          {
            title: 'Order Tracking',
            content: 'Once your order is shipped, you will receive a tracking number via your account. You can use this number to track your package through our logistics partner. Tracking information is typically available within 24 hours of dispatch.',
          },
          {
            title: 'Delivery Issues',
            content: 'If you experience any delivery issues, please contact us at support@hzastore.com or call us. We will liaise with our delivery partner to resolve the issue as quickly as possible.',
          },
          {
            title: 'Failed Delivery',
            content: 'If a delivery attempt fails, our courier will try to contact you. After 2 failed attempts, the order will be returned to us. You can request redelivery at an additional charge or we will process a refund after deducting the delivery charge.',
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
