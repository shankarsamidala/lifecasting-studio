import { ResourceManager } from '../components/ResourceManager'
import type { NavLink } from '../../types/content'

export function NavLinksPage() {
  return (
    <ResourceManager<NavLink>
      description="Shipping, returns, about, and contact links in the header dropdown."
      resourcePath="/nav-links"
      fields={[
        { key: 'label', label: 'Label', type: 'text', required: true },
        { key: 'href', label: 'Link (URL or path)', type: 'text', required: true },
        { key: 'group', label: 'Group', type: 'text', required: true },
      ]}
      emptyItem={{ label: '', href: '', group: 'customer-service' }}
      renderLabel={(item) => `${item.label} → ${item.href}`}
    />
  )
}
