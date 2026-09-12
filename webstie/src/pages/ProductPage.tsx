import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useGalleryImages } from '../hooks/useHomepageContent'
import { useCategory } from '../hooks/useCatalog'
import { useSiteSettings } from '../hooks/useSiteConfig'
import { categoryHref, modelHref, type FlatPricing, type FormulaPricing, type Model, type TieredPricing } from '../types/content'
import { formatPrice } from '../lib/pricing'
import { buildBookingLink } from '../lib/whatsapp'
import { Section } from '../components/Section/Section'
import { Testimonials } from '../components/Home/Testimonials'
import { SectionTitle } from '../components/Section/SectionTitle'

const VISIBLE_THUMBS = 5

function PriceBlock({
  model,
  ageGroup,
  onAgeGroupChange,
}: {
  model: Model
  ageGroup: string | null
  onAgeGroupChange: (label: string) => void
}) {
  if (model.pricingType === 'ageTiers') {
    const { tiers } = model.pricingConfig as TieredPricing
    return (
      <fieldset className="mb-5 border-0 p-0">
        <legend className="mb-3 font-sans text-sm font-semibold text-text">
          Select Age Category & Price
        </legend>
        <div className="space-y-2">
          {tiers.map((tier) => (
            <button
              key={tier.label}
              type="button"
              onClick={() => onAgeGroupChange(tier.label)}
              aria-pressed={ageGroup === tier.label}
              className={`flex w-full items-center justify-between rounded-lg border-2 px-4 py-3 text-left transition-colors duration-200 ${
                ageGroup === tier.label
                  ? 'border-primary'
                  : 'border-ink-900/10 hover:border-primary/40'
              }`}
            >
              <span
                className={`font-sans text-sm ${
                  ageGroup === tier.label ? 'font-semibold text-text' : 'text-text-muted'
                }`}
              >
                {tier.label}
              </span>
              <span className="flex items-baseline gap-1.5">
                <span
                  className={`font-display text-xl font-bold ${
                    ageGroup === tier.label ? 'text-primary' : 'text-primary/70'
                  }`}
                >
                  {formatPrice(tier.price)}
                </span>
                {tier.strikePrice ? (
                  <span className="font-sans text-sm font-normal text-text-muted line-through">
                    {formatPrice(tier.strikePrice)}
                  </span>
                ) : null}
              </span>
            </button>
          ))}
        </div>
      </fieldset>
    )
  }

  if (model.pricingType === 'sizeTiers') {
    const { tiers } = model.pricingConfig as TieredPricing
    return (
      <div className="mb-5">
        <h2 className="mb-2 font-sans text-sm font-semibold text-text">Sizes & Pricing</h2>
        <ul className="m-0 list-none space-y-1 p-0 font-sans text-sm text-text-muted">
          {tiers.map((tier) => (
            <li key={tier.label} className="flex justify-between border-b border-ink-900/10 py-1.5">
              <span>{tier.label}</span>
              <span className="font-display text-base font-bold text-primary">{formatPrice(tier.price)}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (model.pricingType === 'formula') {
    const { text } = model.pricingConfig as FormulaPricing
    return <p className="mb-5 font-display text-xl font-bold text-primary">{text}</p>
  }

  const { price, strikePrice } = model.pricingConfig as FlatPricing
  return (
    <p className="mb-5 font-display text-2xl font-bold text-primary">
      {price ? formatPrice(price) : 'Price on request'}
      {strikePrice ? (
        <span className="ml-2 font-sans text-base font-normal text-text-muted line-through">
          {formatPrice(strikePrice)}
        </span>
      ) : null}
    </p>
  )
}

export function ProductPage() {
  const { categorySlug, modelSlug } = useParams<{ categorySlug: string; modelSlug: string }>()
  const { category, loading } = useCategory(categorySlug)
  const model = category?.models.find((entry) => entry.slug === modelSlug)
  const modelIndex = model ? category!.models.indexOf(model) : -1
  const { data: galleryImagesData } = useGalleryImages()
  const { data: siteSettings } = useSiteSettings()

  const initialAgeGroup =
    model?.pricingType === 'ageTiers' ? (model.pricingConfig as TieredPricing).tiers[0]?.label ?? null : null

  const [activeImage, setActiveImage] = useState(0)
  const [showAllThumbs, setShowAllThumbs] = useState(false)
  const [ageGroup, setAgeGroup] = useState<string | null>(initialAgeGroup)
  const lastModelSlug = useRef(model?.slug)
  if (lastModelSlug.current !== model?.slug) {
    lastModelSlug.current = model?.slug
    setActiveImage(0)
    setShowAllThumbs(false)
    setAgeGroup(initialAgeGroup)
  }

  if (loading) return null

  if (!category || !model || !galleryImagesData || galleryImagesData.length === 0) {
    return (
      <Section>
        <div className="py-20 text-center">
          <h1>Model not found</h1>
          <Link to="/" className="btn-primary mt-6 inline-flex no-underline">
            Back to Home
          </Link>
        </div>
      </Section>
    )
  }

  const galleryImages = model.imageUrl
    ? [{ id: model.id, src: model.imageUrl }]
    : Array.from(
        { length: 20 },
        (_, index) => galleryImagesData[(modelIndex + index) % galleryImagesData.length],
      )
  const visibleThumbs = showAllThumbs ? galleryImages : galleryImages.slice(0, VISIBLE_THUMBS)
  const hiddenThumbCount = showAllThumbs ? 0 : galleryImages.length - VISIBLE_THUMBS
  const otherModels = category.models.filter((entry) => entry.slug !== model.slug)
  const bookingDetail = model.pricingType === 'ageTiers' ? `${model.label} (${ageGroup})` : model.label

  return (
    <>
      <Section topSpacing="tight" bottomSpacing="none">
        <nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap gap-1 font-sans text-sm text-text-muted">
          <Link to="/" className="no-underline hover:text-primary">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link to={categoryHref(category)} className="no-underline hover:text-primary">
            {category.label}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-text">{model.label}</span>
        </nav>
      </Section>

      <Section topSpacing="default" bottomSpacing="none">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <div className="flex gap-3">
              <ul
                role="list"
                className={`m-0 ${galleryImages.length > 1 ? 'hidden sm:flex' : 'hidden'} w-16 shrink-0 list-none flex-col gap-2 p-0 ${
                  showAllThumbs
                    ? 'max-h-[560px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
                    : ''
                }`}
              >
                {visibleThumbs.map((image, index) => {
                  const isMoreTile = !showAllThumbs && index === VISIBLE_THUMBS - 1 && hiddenThumbCount > 0
                  return (
                    <li key={`thumb-${image.id}-${index}`}>
                      <button
                        type="button"
                        onClick={() => (isMoreTile ? setShowAllThumbs(true) : setActiveImage(index))}
                        aria-current={!isMoreTile && activeImage === index}
                        aria-label={
                          isMoreTile ? `View all ${galleryImages.length} images` : `View image ${index + 1}`
                        }
                        className={`relative block aspect-square w-full overflow-hidden rounded-lg ring-2 transition-all duration-200 ${
                          activeImage === index && !isMoreTile
                            ? 'ring-primary'
                            : 'ring-transparent hover:ring-primary/30'
                        }`}
                      >
                        <img src={image.src} alt="" loading="lazy" className="h-full w-full object-cover" />
                        {isMoreTile ? (
                          <span className="absolute inset-0 flex items-center justify-center bg-ink-900/60 font-sans text-sm font-bold text-white">
                            +{hiddenThumbCount}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  )
                })}
              </ul>

              <div className="min-w-0 flex-1 overflow-hidden rounded-2xl">
                <img
                  src={galleryImages[activeImage].src}
                  alt=""
                  loading="eager"
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
            </div>

            <ul
              role="list"
              className={`m-0 mt-3 ${galleryImages.length > 1 ? 'flex' : 'hidden'} list-none gap-2 overflow-x-auto p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:hidden`}
            >
              {visibleThumbs.map((image, index) => {
                const isMoreTile = !showAllThumbs && index === VISIBLE_THUMBS - 1 && hiddenThumbCount > 0
                return (
                  <li key={`thumb-mobile-${image.id}-${index}`} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => (isMoreTile ? setShowAllThumbs(true) : setActiveImage(index))}
                      aria-current={!isMoreTile && activeImage === index}
                      aria-label={
                        isMoreTile ? `View all ${galleryImages.length} images` : `View image ${index + 1}`
                      }
                      className={`relative block h-16 w-16 overflow-hidden rounded-lg ring-2 transition-all duration-200 ${
                        activeImage === index && !isMoreTile
                          ? 'ring-primary'
                          : 'ring-transparent hover:ring-primary/30'
                      }`}
                    >
                      <img src={image.src} alt="" loading="lazy" className="h-full w-full object-cover" />
                      {isMoreTile ? (
                        <span className="absolute inset-0 flex items-center justify-center bg-ink-900/60 font-sans text-sm font-bold text-white">
                          +{hiddenThumbCount}
                        </span>
                      ) : null}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          <div>
            <span className="mb-1.5 inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-sans text-xs font-semibold text-primary">
              {category.label}
            </span>
            <h1 className="font-display mb-1 text-2xl leading-tight font-semibold text-text sm:text-[1.75rem]">
              {model.label}
            </h1>
            {model.code ? (
              <p className="mb-4 font-sans text-xs text-text-muted">Model: {model.code}</p>
            ) : null}

            {category.showReviews ? (
              <a
                href="#reviews"
                className="mb-4 flex items-center gap-1.5 no-underline"
                aria-label="See customer reviews"
              >
                <span className="flex text-accent" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <svg key={index} className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" />
                    </svg>
                  ))}
                </span>
                <span className="font-sans text-sm font-medium text-text-muted underline decoration-transparent hover:text-primary hover:decoration-primary">
                  See what parents are saying
                </span>
              </a>
            ) : null}

            {/* Buy box: price, booking CTA, and trust signals grouped to drive an immediate decision */}
            <div className="mb-6 rounded-2xl border-2 border-ink-900/20 bg-surface p-5 sm:p-6">
              <PriceBlock model={model} ageGroup={ageGroup} onAgeGroupChange={setAgeGroup} />

              {model.variantType === 'customization' && model.customizationNote ? (
                <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <p className="mb-1 font-sans text-xs font-semibold text-primary">Customization Details</p>
                  <p className="font-sans text-sm whitespace-pre-line text-text-muted">{model.customizationNote}</p>
                </div>
              ) : null}

              {siteSettings ? (
                <a
                  href={buildBookingLink(siteSettings.whatsappNumber, siteSettings.bookingMessageTemplate, {
                    modelLabel: bookingDetail,
                    categoryLabel: category.label,
                    imageUrl: `${window.location.origin}${galleryImages[activeImage].src}`,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary group mb-2 flex w-full items-center justify-center gap-2 no-underline transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30"
                >
                  Book Now
                  <svg
                    className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              ) : null}
              <p className="mb-4 text-center font-sans text-xs text-text-muted">
                Tap to chat directly with our studio on WhatsApp — quick replies, no forms.
              </p>

              <div className="grid grid-cols-3 gap-2 border-t border-ink-900/10 pt-4">
                <div className="flex flex-col items-center gap-1 text-center">
                  <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <span className="font-sans text-[11px] leading-tight text-text-muted">
                    Safe & Organic Materials
                  </span>
                </div>
                {category.warranty ? (
                  <div className="flex flex-col items-center gap-1 text-center">
                    <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12.75 11.25 15 15 9.75M21 12c0 1.6-.75 3.02-1.92 3.93a4.5 4.5 0 0 1-1.36 3.97 4.5 4.5 0 0 1-3.97 1.36A4.49 4.49 0 0 1 12 21c-1.6 0-3.02-.75-3.93-1.92a4.5 4.5 0 0 1-3.97-1.36 4.5 4.5 0 0 1-1.36-3.97A4.49 4.49 0 0 1 1.5 12c0-1.6.75-3.02 1.92-3.93a4.5 4.5 0 0 1 1.36-3.97 4.5 4.5 0 0 1 3.97-1.36A4.49 4.49 0 0 1 12 1.5c1.6 0 3.02.75 3.93 1.92a4.5 4.5 0 0 1 3.97 1.36 4.5 4.5 0 0 1 1.36 3.97A4.49 4.49 0 0 1 21 12Z" />
                    </svg>
                    <span className="font-sans text-[11px] leading-tight text-text-muted">
                      {category.warranty}
                    </span>
                  </div>
                ) : null}
                <div className="flex flex-col items-center gap-1 text-center">
                  <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
                  </svg>
                  <span className="font-sans text-[11px] leading-tight text-text-muted">
                    Handcrafted in Bengaluru
                  </span>
                </div>
              </div>

              {siteSettings ? (
                <p className="mt-4 border-t border-ink-900/10 pt-4 text-center font-sans text-sm text-text-muted">
                  {siteSettings.priceDisclaimer}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              {model.preservationNote ? (
                <details open className="group rounded-xl border border-ink-900/10 bg-surface p-4 open:pb-4">
                  <summary className="cursor-pointer list-none font-sans text-sm font-semibold text-text marker:content-none">
                    Preservation
                  </summary>
                  <p className="mt-2 font-sans text-sm text-text-muted">{model.preservationNote}</p>
                </details>
              ) : null}

              {category.preservation && category.preservation.length > 0 ? (
                <details open className="group rounded-xl border border-ink-900/10 bg-surface p-4 open:pb-4">
                  <summary className="cursor-pointer list-none font-sans text-sm font-semibold text-text marker:content-none">
                    Preservation
                  </summary>
                  <ul className="m-0 mt-2 list-disc space-y-1 pl-5 font-sans text-sm text-text-muted">
                    {category.preservation.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </details>
              ) : null}

              {category.castingDelivery && category.castingDelivery.length > 0 ? (
                <details open className="group rounded-xl border border-ink-900/10 bg-surface p-4 open:pb-4">
                  <summary className="cursor-pointer list-none font-sans text-sm font-semibold text-text marker:content-none">
                    Casting and delivery details
                  </summary>
                  <ul className="m-0 mt-2 list-disc space-y-1 pl-5 font-sans text-sm text-text-muted">
                    {category.castingDelivery.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </details>
              ) : null}

              {category.finalDelivery && category.finalDelivery.length > 0 ? (
                <details open className="group rounded-xl border border-ink-900/10 bg-surface p-4 open:pb-4">
                  <summary className="cursor-pointer list-none font-sans text-sm font-semibold text-text marker:content-none">
                    Final delivery
                  </summary>
                  <ul className="m-0 mt-2 list-disc space-y-1 pl-5 font-sans text-sm text-text-muted">
                    {category.finalDelivery.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </details>
              ) : null}

              {category.castingProcess ? (
                <details open className="group rounded-xl border border-ink-900/10 bg-surface p-4 open:pb-4">
                  <summary className="cursor-pointer list-none font-sans text-sm font-semibold text-text marker:content-none">
                    Casting process
                  </summary>
                  <p className="mt-2 font-sans text-sm text-text-muted">{category.castingProcess}</p>
                </details>
              ) : null}

              {category.materials && category.materials.length > 0 ? (
                <details open className="group rounded-xl border border-ink-900/10 bg-surface p-4 open:pb-4">
                  <summary className="cursor-pointer list-none font-sans text-sm font-semibold text-text marker:content-none">
                    Material used
                  </summary>
                  <ul className="m-0 mt-2 list-disc space-y-1 pl-5 font-sans text-sm text-text-muted">
                    {category.materials.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </details>
              ) : null}
            </div>
          </div>
        </div>
      </Section>

      {otherModels.length > 0 ? (
        <Section topSpacing="default" bottomSpacing="default">
          <h2 className="mb-6 text-center">You May Also Like</h2>
          <ul role="list" className="m-0 grid list-none grid-cols-2 gap-4 p-0 sm:gap-6 lg:grid-cols-4">
            {otherModels.map((related, index) => {
              const relatedImage = related.imageUrl
                ? { src: related.imageUrl }
                : galleryImagesData[index % galleryImagesData.length]
              return (
                <li key={related.slug}>
                  <Link to={modelHref(category, related)} className="block text-center no-underline">
                    <div className="aspect-[3/4] overflow-hidden rounded-2xl">
                      <img
                        src={relatedImage.src}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <h3 className="mt-4 font-display text-base font-semibold text-text">
                      {related.label}
                    </h3>
                  </Link>
                </li>
              )
            })}
          </ul>
        </Section>
      ) : null}

      {category.showReviews ? (
        <div id="reviews">
          <SectionTitle title="Client Stories" />
          <Testimonials />
        </div>
      ) : null}
    </>
  )
}
