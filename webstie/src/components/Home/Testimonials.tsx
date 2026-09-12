import { useTestimonials } from '../../hooks/useHomepageContent'
import { useSiteSettings } from '../../hooks/useSiteConfig'
import { Section } from '../Section/Section'

function Stars({ rating }: { rating: number }) {
  return (
    <div className="mb-4 flex gap-1" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: rating }).map((_, index) => (
        <svg
          key={index}
          className="h-5 w-5 text-accent"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" />
        </svg>
      ))}
    </div>
  )
}

export function Testimonials() {
  const { data: testimonials } = useTestimonials()
  const { data: settings } = useSiteSettings()

  if (!testimonials || testimonials.length === 0) return null

  return (
    <Section topSpacing="none" bottomSpacing="none">
      <ul
        role="list"
        className="m-0 flex list-none snap-x snap-mandatory gap-6 overflow-x-auto p-0 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {testimonials.map((testimonial) => (
          <li key={testimonial.id} className="w-[80%] shrink-0 snap-start md:w-[50%] lg:w-[38%]">
            <a
              href={testimonial.reviewHref}
              target="_blank"
              rel="noopener noreferrer"
              className="relative block h-full rounded-2xl border border-ink-900/10 bg-surface p-6 no-underline"
            >
              <span
                aria-hidden="true"
                className="font-display absolute top-4 right-4 text-5xl leading-none text-primary/15"
              >
                &rdquo;
              </span>

              <div className="relative z-10">
                <Stars rating={testimonial.rating} />
                <p className="mb-4 line-clamp-4 font-sans text-sm leading-relaxed text-text-muted">
                  {testimonial.quote}
                </p>

                <div className="flex items-center gap-3 border-t border-ink-900/10 pt-4">
                  {testimonial.avatarUrl ? (
                    <img
                      src={testimonial.avatarUrl}
                      alt={testimonial.name}
                      loading="lazy"
                      className="h-12 w-12 shrink-0 rounded-full border-2 border-accent/30 object-cover"
                    />
                  ) : (
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-accent/30 bg-accent/10">
                      <span className="font-display text-lg font-bold text-accent">
                        {testimonial.name.charAt(0)}
                      </span>
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <h4 className="mb-0.5 truncate font-sans text-base font-bold text-text">
                      {testimonial.name}
                    </h4>
                    <p className="font-sans text-xs text-text-muted">Verified Customer</p>
                  </div>

                  <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 font-sans text-xs font-semibold text-primary">
                    {testimonial.category}
                  </span>
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>

      {settings ? (
        <div className="mt-10 text-center sm:mt-12">
          <a
            href={settings.viewAllReviewsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary no-underline"
          >
            View All Reviews
          </a>
        </div>
      ) : null}
    </Section>
  )
}
