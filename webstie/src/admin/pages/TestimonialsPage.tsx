import { ResourceManager } from '../components/ResourceManager'
import type { Testimonial } from '../../types/content'

export function TestimonialsPage() {
  return (
    <ResourceManager<Testimonial>
      description="Customer reviews shown on the homepage and category pages."
      resourcePath="/testimonials"
      fields={[
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'quote', label: 'Quote', type: 'textarea', required: true },
        { key: 'rating', label: 'Rating (1-5)', type: 'number', required: true },
        { key: 'category', label: 'Category tag', type: 'text', required: true },
        { key: 'reviewHref', label: 'Review link', type: 'text', required: true },
        { key: 'avatarUrl', label: 'Avatar (optional)', type: 'image' },
      ]}
      emptyItem={{ name: '', quote: '', rating: 5, category: '', reviewHref: '', avatarUrl: '' }}
      renderLabel={(item) => `${item.name} — ${item.rating}★`}
    />
  )
}
