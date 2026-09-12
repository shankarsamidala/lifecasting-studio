import { toNavGroups } from '../Header/nav-data'
import { useCatalog } from '../../hooks/useCatalog'
import { useFooterSettings } from '../../hooks/useSiteConfig'

const SOCIAL_ICON_PATHS: Record<string, React.ReactNode> = {
  instagram: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.256 1.216.6 1.772 1.153a4.9 4.9 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.048 1.066.06 1.405.06 4.122 0 2.717-.012 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.9 4.9 0 0 1-1.153 1.772 4.9 4.9 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.048-1.405.06-4.122.06-2.717 0-3.056-.012-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.9 4.9 0 0 1-1.772-1.153 4.9 4.9 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.013-3.056.06-4.122.05-1.065.218-1.79.465-2.428a4.9 4.9 0 0 1 1.153-1.772A4.9 4.9 0 0 1 5.45 2.525c.637-.248 1.363-.415 2.428-.465C8.944 2.013 9.283 2 12 2Zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8.25a3.25 3.25 0 1 1 0-6.5 3.25 3.25 0 0 1 0 6.5ZM17.25 5.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z"
    />
  ),
  facebook: (
    <path d="M13.5 22v-8h2.7l.4-3.3h-3.1V8.6c0-.96.27-1.6 1.65-1.6h1.75V4.14C15.94 4.1 15 4 13.9 4c-2.3 0-3.9 1.4-3.9 4v2.7H7.3v3.3H10v8h3.5Z" />
  ),
  email: (
    <path d="M2.003 5.884 10 9.882l7.997-3.998A2 2 0 0 0 16 4H4a2 2 0 0 0-1.997 1.884ZM18 8.118l-8 4-8-4V14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.118Z" />
  ),
}

export function Footer() {
  const { data: categories } = useCatalog()
  const { data: settings } = useFooterSettings()

  if (!settings) return null

  const serviceLinks = toNavGroups(categories ?? []).slice(0, 6)

  return (
    <footer className="relative mt-12 overflow-hidden border-t border-ink-900/10 bg-surface text-text sm:mt-16">
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 lg:px-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-6">
            <div>
              <h3 className="font-display mb-4 text-2xl font-bold">
                Lifecasting <span className="text-primary">Studio</span>
              </h3>
              <p className="mb-6 font-sans text-sm leading-relaxed text-text-muted">{settings.tagline}</p>
            </div>
            <p className="font-sans text-sm leading-relaxed text-text-muted">
              <span className="font-semibold text-text">Address:</span>
              <br />
              {settings.addressLine1}
              <br />
              {settings.addressLine2}
              <br />
              {settings.addressLine3}
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="font-display text-xl font-bold text-primary">Our Services</h4>
            <ul role="list" className="m-0 flex list-none flex-col gap-3 p-0">
              {serviceLinks.map((service) => (
                <li key={service.href}>
                  <a
                    href={service.href}
                    className="group flex items-center gap-2 font-sans text-sm text-text-muted no-underline transition-colors duration-300 hover:text-primary"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary transition-transform duration-300 group-hover:scale-150" />
                    {service.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-display text-xl font-bold text-primary">Business Hours</h4>
            <div className="space-y-3 font-sans text-sm text-text-muted">
              {settings.businessHours.map((entry) => (
                <div
                  key={entry.label}
                  className="flex items-center justify-between border-b border-ink-900/10 pb-2"
                >
                  <span className="font-semibold text-text">{entry.label}</span>
                  <span>{entry.hours}</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-ink-900/10 bg-surface/60 p-4 backdrop-blur-sm">
              <h5 className="mb-2 flex items-center gap-2 font-semibold text-text">
                <svg
                  className="h-5 w-5 text-primary"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0 0 10 1.944 11.954 11.954 0 0 0 17.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001Zm11.541 3.708a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4Z"
                    clipRule="evenodd"
                  />
                </svg>
                {settings.safetyTitle}
              </h5>
              <p className="text-xs leading-relaxed text-text-muted">{settings.safetyText}</p>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-display text-xl font-bold text-primary">Get in Touch</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M2 3a1 1 0 0 1 1-1h2.153a1 1 0 0 1 .986.836l.74 4.435a1 1 0 0 1-.54 1.06l-1.548.773a11.037 11.037 0 0 0 6.105 6.105l.774-1.548a1 1 0 0 1 1.059-.54l4.435.74a1 1 0 0 1 .836.986V17a1 1 0 0 1-1 1H15C7.82 18 2 12.18 2 5V3Z" />
                </svg>
                <div>
                  <p className="mb-1 text-xs text-text-muted">Phone</p>
                  <a
                    href={settings.phoneHref}
                    className="font-sans text-sm font-medium text-text no-underline transition-colors duration-300 hover:text-primary"
                  >
                    {settings.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M2.003 5.884 10 9.882l7.997-3.998A2 2 0 0 0 16 4H4a2 2 0 0 0-1.997 1.884Z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.118Z" />
                </svg>
                <div>
                  <p className="mb-1 text-xs text-text-muted">Email</p>
                  <a
                    href={`mailto:${settings.email}`}
                    className="font-sans text-sm font-medium break-all text-text no-underline transition-colors duration-300 hover:text-primary"
                  >
                    {settings.email}
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-sans text-sm font-semibold text-text">Follow Us</h5>
              <div className="flex gap-3">
                {settings.socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="group flex h-10 w-10 items-center justify-center rounded-full border border-ink-900/10 bg-surface/60 transition-all duration-300 hover:border-primary/40 hover:bg-primary/10"
                  >
                    <svg
                      className="h-5 w-5 text-text-muted transition-colors group-hover:text-text"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      {SOCIAL_ICON_PATHS[social.icon] ?? null}
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 border-t border-ink-900/10">
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-12">
          <div className="flex flex-col items-center justify-between gap-3 text-center md:flex-row md:gap-4 md:text-left">
            <p className="font-sans text-sm text-text-muted">
              &copy; {new Date().getFullYear()} Lifecasting Studio. All rights
              reserved.
            </p>
            <div className="flex flex-col items-center gap-2 font-sans text-sm sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3">
              <a
                href={settings.privacyHref}
                className="text-text-muted no-underline transition-colors duration-300 hover:text-primary"
              >
                Privacy Policy
              </a>
              <span className="hidden text-ink-900/20 sm:inline" aria-hidden="true">
                &bull;
              </span>
              <a
                href={settings.termsHref}
                className="text-text-muted no-underline transition-colors duration-300 hover:text-primary"
              >
                Terms of Service
              </a>
              <span className="hidden text-ink-900/20 sm:inline" aria-hidden="true">
                &bull;
              </span>
              <span className="text-text-muted">
                Made with <span className="text-red-500">&#10084;&#65039;</span> in
                Bengaluru
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
