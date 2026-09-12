export type PriceTier = { label: string; price: number; strikePrice?: number }
export type FilterGroup = { slug: string; label: string }
export type PricingType = 'flat' | 'ageTiers' | 'sizeTiers' | 'formula'

export type FlatPricing = { price?: number; strikePrice?: number }
export type TieredPricing = { tiers: PriceTier[] }
export type FormulaPricing = { text: string }

export type VariantType = 'standard' | 'customization'

export type Model = {
  id: string
  categoryId: string
  slug: string
  label: string
  code?: string | null
  group?: string | null
  imageUrl?: string | null
  variantType: VariantType
  customizationNote?: string | null
  position: number
  pricingType: PricingType
  pricingConfig: FlatPricing | TieredPricing | FormulaPricing
  preservationNote?: string | null
}

export type Category = {
  id: string
  slug: string
  label: string
  position: number
  filters?: FilterGroup[] | null
  warranty?: string | null
  castingDelivery?: string[] | null
  finalDelivery?: string[] | null
  castingProcess?: string | null
  materials?: string[] | null
  preservation?: string[] | null
  showReviews: boolean
  models: Model[]
}

export type HeroImage = { id: string; src: string; title: string; position: number }

export type GalleryImage = {
  id: string
  src: string
  title: string
  category?: string | null
  position: number
}

export type Testimonial = {
  id: string
  name: string
  quote: string
  rating: number
  category: string
  reviewHref: string
  avatarUrl?: string | null
  position: number
}

export type Faq = { id: string; question: string; answer: string; position: number }

export type NavLink = { id: string; group: string; label: string; href: string; position: number }

export type BusinessHour = { label: string; hours: string }
export type SocialLink = { label: string; href: string; icon: string }

export type FooterSettings = {
  id: string
  tagline: string
  safetyTitle: string
  safetyText: string
  phone: string
  phoneHref: string
  email: string
  addressLine1: string
  addressLine2: string
  addressLine3: string
  businessHours: BusinessHour[]
  socialLinks: SocialLink[]
  privacyHref: string
  termsHref: string
}

export type SiteSettings = {
  id: string
  whatsappNumber: string
  bookingMessageTemplate: string
  priceDisclaimer: string
  viewAllReviewsHref: string
  shippingPolicy: string
}

export function categoryHref(category: Pick<Category, 'slug'>): string {
  return `/collections/${category.slug}`
}

export function modelHref(category: Pick<Category, 'slug'>, model: Pick<Model, 'slug'>): string {
  return `/collections/${category.slug}/${model.slug}`
}
