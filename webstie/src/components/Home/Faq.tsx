import { useFaqs } from '../../hooks/useHomepageContent'
import { Section } from '../Section/Section'

export function Faq() {
  const { data: faqs } = useFaqs()

  if (!faqs || faqs.length === 0) return null

  return (
    <Section topSpacing="none" bottomSpacing="tight">
      <div className="mx-auto max-w-4xl space-y-3">
        {faqs.map((faq) => (
          <details
            key={faq.id}
            className="group overflow-hidden rounded-2xl border border-ink-900/10 bg-surface shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 marker:content-none">
              <h3 className="font-sans text-base font-semibold text-text transition-colors duration-300 group-hover:text-primary md:text-lg">
                {faq.question}
              </h3>
              <svg
                className="h-6 w-6 shrink-0 text-primary transition-transform duration-300 group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-5 pb-5">
              <p className="mt-3 border-t border-ink-900/10 pt-3 font-sans text-sm leading-relaxed text-text-muted md:text-base">
                {faq.answer}
              </p>
            </div>
          </details>
        ))}
      </div>

      <div className="mt-10 text-center">
        <p className="mb-4 font-sans text-sm text-text-muted">Still have questions?</p>
        <a href="/contact" className="btn-primary no-underline">
          Contact Us
        </a>
      </div>
    </Section>
  )
}
