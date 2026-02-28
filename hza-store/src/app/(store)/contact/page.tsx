'use client'
import { useState } from 'react'
import { Mail, Phone, MapPin, MessageSquare, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })

  const contactInfo = [
    { icon: Phone, label: 'Phone', value: '0321-2190924', href: 'tel:03212190924' },
    { icon: Mail, label: 'Email', value: 'hzagroups1@gmail.com', href: 'mailto:hzagroups1@gmail.com' },
    { icon: MapPin, label: 'Address', value: 'Karachi, Pakistan', href: null },
  ];
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields')
      return
    }
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('support_queries').insert({
        user_id: user?.id ?? null,
        name: formData.name,
        email: formData.email,
        subject: formData.subject || 'General Inquiry',
        message: formData.message,
        status: 'open',
      })
      if (error) throw error
      toast.success("Message sent! We'll get back to you within 24 hours.")
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-white pb-16 pt-24 md:pt-28">
      {/* Hero Section */}
      <section className="w-full bg-white/80 border-b border-slate-100 py-12 md:py-16 mb-10">
        <div className="container max-w-3xl mx-auto px-4 flex flex-col items-center text-center">
          <div className="mb-6">
            <Mail className="h-12 w-12 text-primary mx-auto mb-2" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-slate-900">Contact Us</h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">Have a question or need help? We&apos;d love to hear from you.</p>
        </div>
      </section>

      <div className="container max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold">Get in Touch</h2>
          <div className="space-y-4">
            {contactInfo.map((item) => (
              <div key={item.label} className="flex items-start gap-4 p-4 border rounded-xl">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="font-medium hover:text-primary transition-colors">
                      {item.value}
                    </a>
                  ) : (
                    <p className="font-medium">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          </div>

          <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
            <h3 className="font-semibold mb-1 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Business Hours
            </h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Monday – Saturday: 9:00 AM – 6:00 PM</p>
              <p>Sunday: Closed</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-3">
          <div className="border rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" placeholder="Your name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" placeholder="your@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="What's this about?" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea id="message" placeholder="Tell us how we can help..." rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
