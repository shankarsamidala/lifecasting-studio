import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useGalleryImages } from '../hooks/useHomepageContent'
import { useCategory } from '../hooks/useCatalog'
import { modelHref } from '../types/content'
import { formatStartingPrice } from '../lib/pricing'
import { Section } from '../components/Section/Section'

export function CategoryPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const { category, loading } = useCategory(categorySlug)
  const { data: galleryImages } = useGalleryImages()
  const activeFilter = searchParams.get('group')

  if (loading) return null

  if (!category) {
    return (
      <Section>
        <div className="py-20 text-center">
          <h1>Category not found</h1>
          <Link to="/" className="btn-primary mt-6 inline-flex no-underline">
            Back to Home
          </Link>
        </div>
      </Section>
    )
  }

  const visibleModels = activeFilter
    ? category.models.filter((model) => model.group === activeFilter)
    : category.models

  return (
    <>
      <Section topSpacing="tight" bottomSpacing="none">
        <nav aria-label="Breadcrumb" className="mb-2 font-sans text-sm text-text-muted">
          <Link to="/" className="no-underline hover:text-primary">
            Home
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span className="text-text">{category.label}</span>
        </nav>
        <h1 className="mb-2">{category.label}</h1>
        <p className="max-w-2xl font-sans text-sm text-text-muted sm:text-base">
          Every {category.label.toLowerCase()} option we offer, in one place. Message us on
          WhatsApp for pricing and to book your session.
        </p>

        {category.filters && category.filters.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSearchParams({})}
              aria-pressed={!activeFilter}
              className={`rounded-full border px-4 py-2 font-sans text-sm transition-colors duration-200 ${
                !activeFilter
                  ? 'border-primary bg-primary text-white'
                  : 'border-ink-900/15 bg-surface text-text hover:border-primary/40'
              }`}
            >
              All
            </button>
            {category.filters.map((filter) => (
              <button
                key={filter.slug}
                type="button"
                onClick={() => setSearchParams({ group: filter.slug })}
                aria-pressed={activeFilter === filter.slug}
                className={`rounded-full border px-4 py-2 font-sans text-sm transition-colors duration-200 ${
                  activeFilter === filter.slug
                    ? 'border-primary bg-primary text-white'
                    : 'border-ink-900/15 bg-surface text-text hover:border-primary/40'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        ) : null}
      </Section>

      <Section topSpacing="default" bottomSpacing="default">
        {visibleModels.length > 0 && galleryImages ? (
          <ul role="list" className="m-0 grid list-none grid-cols-2 gap-4 p-0 sm:gap-6 lg:grid-cols-4">
            {visibleModels.map((model, index) => {
              const sampleImage = model.imageUrl ? { src: model.imageUrl } : galleryImages[index % galleryImages.length]
              return (
                <li key={model.slug} className="flex flex-col text-center">
                  <Link to={modelHref(category, model)} className="block no-underline">
                    <div className="aspect-[3/4] overflow-hidden rounded-2xl">
                      {sampleImage ? (
                        <img
                          src={sampleImage.src}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <h3 className="mt-4 font-display text-base font-semibold text-text">
                      {model.label}
                    </h3>
                    <p className="mt-1 font-sans text-sm text-text-muted">
                      {formatStartingPrice(model)}
                    </p>
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="py-16 text-center font-sans text-text-muted">
            No models in this filter yet — check back soon.
          </p>
        )}
      </Section>
    </>
  )
}
