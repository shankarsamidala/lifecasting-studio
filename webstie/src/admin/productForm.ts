import type { VariantType } from '../types/content'

export const AGE_TIER_LABELS = {
  under6Months: '0-6 months',
  aboveOneYear: '1 year and above',
} as const

export type AgeTierKey = keyof typeof AGE_TIER_LABELS

export const VARIANT_TYPE_LABELS: Record<VariantType, string> = {
  standard: 'Standard',
  customization: 'Customization',
}

export type ProductFormValues = {
  categoryId: string
  slug: string
  code: string
  group: string
  imageUrl: string
  variantType: VariantType
  customizationNote: string
  priceUnder6Months: number | ''
  priceUnder6MonthsStrike: number | ''
  priceAboveOneYear: number | ''
  priceAboveOneYearStrike: number | ''
  preservationNote: string
}

export const EMPTY_PRODUCT_FORM: ProductFormValues = {
  categoryId: '',
  slug: '',
  code: '',
  group: '',
  imageUrl: '',
  variantType: 'standard',
  customizationNote: '',
  priceUnder6Months: '',
  priceUnder6MonthsStrike: '',
  priceAboveOneYear: '',
  priceAboveOneYearStrike: '',
  preservationNote: '',
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Product name is auto-composed from category + type — no manual entry. */
export function generateProductLabel(categoryLabel: string, variantType: VariantType): string {
  return `${categoryLabel} - ${VARIANT_TYPE_LABELS[variantType]}`
}

/**
 * Short internal reference code, e.g. "BABYCASTING-S1" (Standard #1) or
 * "BABYCASTING-C2" (Customization #2). `existingCountForType` is how many
 * products of the same category + type already exist, so the sequence
 * number increments per category/type pair.
 */
export function generateModelCode(
  categoryLabel: string,
  variantType: VariantType,
  existingCountForType: number,
): string {
  const categoryCode = slugify(categoryLabel).replace(/-/g, '').toUpperCase() || 'LCS'
  const typeLetter = variantType === 'standard' ? 'S' : 'C'
  return `${categoryCode}-${typeLetter}${existingCountForType + 1}`
}
