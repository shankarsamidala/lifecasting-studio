import { useSiteSettings } from '../hooks/useSiteConfig'
import { Section } from '../components/Section/Section'

export function ShippingPolicyPage() {
  const { data: settings, loading } = useSiteSettings()

  if (loading) return null

  return (
    <Section topSpacing="default" bottomSpacing="default">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6">Shipping Policy</h1>
        {settings?.shippingPolicy ? (
          <p className="font-sans text-sm leading-relaxed whitespace-pre-line text-text-muted sm:text-base">
            {settings.shippingPolicy}
          </p>
        ) : (
          <p className="font-sans text-sm text-text-muted">Shipping policy coming soon.</p>
        )}
      </div>
    </Section>
  )
}
