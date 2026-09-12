import { Link } from 'react-router-dom'

const CARDS = [
  { to: '/admin/categories', label: 'Categories', description: 'Menu items and their delivery/materials text.' },
  { to: '/admin/products', label: 'Products', description: 'Every product, its category, image, and pricing.' },
  { to: '/admin/hero', label: 'Hero Images', description: 'The homepage top carousel.' },
  { to: '/admin/gallery', label: 'Gallery', description: 'Photos shown across category tiles.' },
  { to: '/admin/testimonials', label: 'Testimonials', description: 'Customer reviews shown on the site.' },
  { to: '/admin/faqs', label: 'FAQs', description: 'The homepage question & answer list.' },
  { to: '/admin/nav-links', label: 'Customer Service Links', description: 'Shipping, returns, about, contact links.' },
  { to: '/admin/footer', label: 'Footer & Contact', description: 'Business hours, address, socials, legal links.' },
  { to: '/admin/settings', label: 'Booking & Settings', description: 'WhatsApp number, booking message, disclaimers.' },
]

export function DashboardHome() {
  return (
    <div>
      <p className="mb-6 font-sans text-sm text-text-muted">Pick what you'd like to edit.</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="block rounded-xl border border-ink-900/10 bg-surface p-5 no-underline transition-colors hover:border-primary/40"
          >
            <h2 className="font-sans text-base font-semibold text-text">{card.label}</h2>
            <p className="mt-1 font-sans text-sm text-text-muted">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
