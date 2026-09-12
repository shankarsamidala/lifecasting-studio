import type { FlatPricing, FormulaPricing, Model, TieredPricing } from '../types/content'

export function formatPrice(price: number): string {
  return `₹${price.toLocaleString('en-IN')}`
}

/** Short "Starting from ₹X" label for a model card, regardless of pricing shape. */
export function formatStartingPrice(model: Model): string {
  switch (model.pricingType) {
    case 'ageTiers':
    case 'sizeTiers': {
      const { tiers } = model.pricingConfig as TieredPricing
      const min = Math.min(...tiers.map((tier) => tier.price))
      return Number.isFinite(min) ? `Starting from ${formatPrice(min)}` : 'Price on request'
    }
    case 'formula':
      return (model.pricingConfig as FormulaPricing).text
    case 'flat':
    default: {
      const { price } = model.pricingConfig as FlatPricing
      return price ? `Starting from ${formatPrice(price)}` : 'Price on request'
    }
  }
}
