import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api } from '../../lib/api'
import type { SiteSettings } from '../../types/content'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function SiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get<SiteSettings>('/settings').then(setSettings)
  }, [])

  if (!settings) return <p className="text-sm text-muted-foreground">Loading…</p>

  const update = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setSettings((current) => (current ? { ...current, [key]: value } : current))

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/settings', settings)
      toast.success('Settings saved')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <p className="mb-6 text-sm text-muted-foreground">
        Controls the "Book Now" WhatsApp message, pricing disclaimer, and shipping policy shown on product pages.
      </p>

      <Card>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>WhatsApp number (digits only, with country code)</Label>
            <Input value={settings.whatsappNumber} onChange={(event) => update('whatsappNumber', event.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Booking message template</Label>
            <p className="text-xs text-muted-foreground">
              Placeholders: <code>{'{{modelLabel}}'}</code>, <code>{'{{categoryLabel}}'}</code>,{' '}
              <code>{'{{imageUrl}}'}</code>
            </p>
            <Textarea
              value={settings.bookingMessageTemplate}
              onChange={(event) => update('bookingMessageTemplate', event.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Price disclaimer</Label>
            <Textarea
              value={settings.priceDisclaimer}
              onChange={(event) => update('priceDisclaimer', event.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Shipping policy</Label>
            <p className="text-xs text-muted-foreground">Shown on every product page.</p>
            <Textarea
              value={settings.shippingPolicy}
              onChange={(event) => update('shippingPolicy', event.target.value)}
              rows={10}
            />
          </div>

          <div className="space-y-1.5">
            <Label>"View All Reviews" link</Label>
            <Input
              value={settings.viewAllReviewsHref}
              onChange={(event) => update('viewAllReviewsHref', event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
