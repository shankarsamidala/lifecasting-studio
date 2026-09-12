import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import type { BusinessHour, FooterSettings, SocialLink } from '../../types/content'

const ICON_OPTIONS = ['instagram', 'facebook', 'email']

export function FooterSettingsPage() {
  const [settings, setSettings] = useState<FooterSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  useEffect(() => {
    api.get<FooterSettings>('/footer').then(setSettings)
  }, [])

  if (!settings) return <p className="font-sans text-sm text-text-muted">Loading…</p>

  const update = <K extends keyof FooterSettings>(key: K, value: FooterSettings[K]) =>
    setSettings((current) => (current ? { ...current, [key]: value } : current))

  const updateHour = (index: number, patch: Partial<BusinessHour>) =>
    update(
      'businessHours',
      settings.businessHours.map((hour, i) => (i === index ? { ...hour, ...patch } : hour)),
    )

  const updateSocial = (index: number, patch: Partial<SocialLink>) =>
    update(
      'socialLinks',
      settings.socialLinks.map((social, i) => (i === index ? { ...social, ...patch } : social)),
    )

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/footer', settings)
      setSavedAt(Date.now())
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <p className="mb-6 font-sans text-sm text-text-muted">
        Everything shown in the site footer: contact details, hours, socials, and legal links.
      </p>

      <div className="space-y-4 rounded-xl border border-ink-900/10 bg-surface p-5">
        <label className="block">
          <span className="mb-1 block font-sans text-sm font-medium text-text">Tagline</span>
          <textarea
            value={settings.tagline}
            onChange={(event) => update('tagline', event.target.value)}
            rows={2}
            className="w-full rounded-lg border border-ink-900/15 px-3 py-2 font-sans text-sm outline-none focus:border-primary"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="mb-1 block font-sans text-sm font-medium text-text">Safety callout title</span>
            <input
              type="text"
              value={settings.safetyTitle}
              onChange={(event) => update('safetyTitle', event.target.value)}
              className="w-full rounded-lg border border-ink-900/15 px-3 py-2 font-sans text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="mb-1 block font-sans text-sm font-medium text-text">Phone</span>
            <input
              type="text"
              value={settings.phone}
              onChange={(event) => update('phone', event.target.value)}
              className="w-full rounded-lg border border-ink-900/15 px-3 py-2 font-sans text-sm outline-none focus:border-primary"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block font-sans text-sm font-medium text-text">Safety callout text</span>
          <textarea
            value={settings.safetyText}
            onChange={(event) => update('safetyText', event.target.value)}
            rows={2}
            className="w-full rounded-lg border border-ink-900/15 px-3 py-2 font-sans text-sm outline-none focus:border-primary"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="mb-1 block font-sans text-sm font-medium text-text">Phone link (tel:)</span>
            <input
              type="text"
              value={settings.phoneHref}
              onChange={(event) => update('phoneHref', event.target.value)}
              className="w-full rounded-lg border border-ink-900/15 px-3 py-2 font-sans text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="mb-1 block font-sans text-sm font-medium text-text">Email</span>
            <input
              type="text"
              value={settings.email}
              onChange={(event) => update('email', event.target.value)}
              className="w-full rounded-lg border border-ink-900/15 px-3 py-2 font-sans text-sm outline-none focus:border-primary"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block font-sans text-sm font-medium text-text">Address line 1</span>
          <input
            type="text"
            value={settings.addressLine1}
            onChange={(event) => update('addressLine1', event.target.value)}
            className="w-full rounded-lg border border-ink-900/15 px-3 py-2 font-sans text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="block">
          <span className="mb-1 block font-sans text-sm font-medium text-text">Address line 2</span>
          <input
            type="text"
            value={settings.addressLine2}
            onChange={(event) => update('addressLine2', event.target.value)}
            className="w-full rounded-lg border border-ink-900/15 px-3 py-2 font-sans text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="block">
          <span className="mb-1 block font-sans text-sm font-medium text-text">Address line 3</span>
          <input
            type="text"
            value={settings.addressLine3}
            onChange={(event) => update('addressLine3', event.target.value)}
            className="w-full rounded-lg border border-ink-900/15 px-3 py-2 font-sans text-sm outline-none focus:border-primary"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="mb-1 block font-sans text-sm font-medium text-text">Privacy policy link</span>
            <input
              type="text"
              value={settings.privacyHref}
              onChange={(event) => update('privacyHref', event.target.value)}
              className="w-full rounded-lg border border-ink-900/15 px-3 py-2 font-sans text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="mb-1 block font-sans text-sm font-medium text-text">Terms link</span>
            <input
              type="text"
              value={settings.termsHref}
              onChange={(event) => update('termsHref', event.target.value)}
              className="w-full rounded-lg border border-ink-900/15 px-3 py-2 font-sans text-sm outline-none focus:border-primary"
            />
          </label>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-ink-900/10 bg-surface p-5">
        <h2 className="mb-3 font-sans text-base font-semibold text-text">Business Hours</h2>
        <div className="space-y-2">
          {settings.businessHours.map((hour, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={hour.label}
                onChange={(event) => updateHour(index, { label: event.target.value })}
                placeholder="Days"
                className="flex-1 rounded-lg border border-ink-900/15 px-3 py-2 font-sans text-sm outline-none focus:border-primary"
              />
              <input
                type="text"
                value={hour.hours}
                onChange={(event) => updateHour(index, { hours: event.target.value })}
                placeholder="Hours"
                className="flex-1 rounded-lg border border-ink-900/15 px-3 py-2 font-sans text-sm outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => update('businessHours', settings.businessHours.filter((_, i) => i !== index))}
                className="rounded-lg border border-red-200 px-3 py-1 font-sans text-sm text-red-600"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => update('businessHours', [...settings.businessHours, { label: '', hours: '' }])}
          className="mt-3 rounded-lg border border-ink-900/15 px-3 py-1.5 font-sans text-sm text-text"
        >
          Add row
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-ink-900/10 bg-surface p-5">
        <h2 className="mb-3 font-sans text-base font-semibold text-text">Social Links</h2>
        <div className="space-y-2">
          {settings.socialLinks.map((social, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={social.label}
                onChange={(event) => updateSocial(index, { label: event.target.value })}
                placeholder="Label"
                className="w-28 rounded-lg border border-ink-900/15 px-3 py-2 font-sans text-sm outline-none focus:border-primary"
              />
              <select
                value={social.icon}
                onChange={(event) => updateSocial(index, { icon: event.target.value })}
                className="rounded-lg border border-ink-900/15 px-3 py-2 font-sans text-sm outline-none focus:border-primary"
              >
                {ICON_OPTIONS.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={social.href}
                onChange={(event) => updateSocial(index, { href: event.target.value })}
                placeholder="URL"
                className="flex-1 rounded-lg border border-ink-900/15 px-3 py-2 font-sans text-sm outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => update('socialLinks', settings.socialLinks.filter((_, i) => i !== index))}
                className="rounded-lg border border-red-200 px-3 py-1 font-sans text-sm text-red-600"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            update('socialLinks', [...settings.socialLinks, { label: '', href: '', icon: 'instagram' }])
          }
          className="mt-3 rounded-lg border border-ink-900/15 px-3 py-1.5 font-sans text-sm text-text"
        >
          Add row
        </button>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button type="button" onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        {savedAt ? <span className="font-sans text-sm text-text-muted">Saved</span> : null}
      </div>
    </div>
  )
}
