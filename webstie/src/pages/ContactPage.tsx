import { useState } from 'react'
import { useSiteSettings } from '../hooks/useSiteConfig'
import { buildWhatsAppLink } from '../lib/whatsapp'
import { Section } from '../components/Section/Section'

export function ContactPage() {
  const { data: settings } = useSiteSettings()
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: '', message: '' })

  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }))

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!settings) return
    const message = [
      `Hi! I'd like to get in touch.`,
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      `Email: ${form.email}`,
      `Subject: ${form.subject}`,
      `Message: ${form.message}`,
    ].join('\n')
    window.open(buildWhatsAppLink(settings.whatsappNumber, message), '_blank', 'noopener,noreferrer')
  }

  return (
    <Section topSpacing="default" bottomSpacing="default">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-5">
          <p className="font-sans text-sm font-medium tracking-wider text-accent uppercase">Lifecasting Studio</p>

          <div className="overflow-hidden rounded-2xl border border-ink-900/10">
            <img src="/images/contact/lcs-map.png" alt="Map to Lifecasting Studio" className="h-64 w-full object-cover" />
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-ink-900/10 bg-surface p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block font-sans text-sm font-medium text-text">
                    Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={update('name')}
                    placeholder="Your Name"
                    className="w-full rounded-lg border border-ink-900/15 px-4 py-3 font-sans text-sm text-text outline-none transition-colors focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="mb-2 block font-sans text-sm font-medium text-text">
                    Phone *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={update('phone')}
                    placeholder="Your Phone"
                    className="w-full rounded-lg border border-ink-900/15 px-4 py-3 font-sans text-sm text-text outline-none transition-colors focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="email" className="mb-2 block font-sans text-sm font-medium text-text">
                    Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={update('email')}
                    placeholder="Your Email"
                    className="w-full rounded-lg border border-ink-900/15 px-4 py-3 font-sans text-sm text-text outline-none transition-colors focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="mb-2 block font-sans text-sm font-medium text-text">
                    Subject *
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={form.subject}
                    onChange={update('subject')}
                    placeholder="Subject"
                    className="w-full rounded-lg border border-ink-900/15 px-4 py-3 font-sans text-sm text-text outline-none transition-colors focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block font-sans text-sm font-medium text-text">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={update('message')}
                  placeholder="Your Message"
                  className="w-full resize-y rounded-lg border border-ink-900/15 px-4 py-3 font-sans text-sm text-text outline-none transition-colors focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={!settings}
                className="btn-primary group flex w-full items-center justify-center gap-2 disabled:opacity-60"
              >
                Send via WhatsApp
                <svg
                  className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </Section>
  )
}
