import { categoryHref, modelHref, type Category } from '../../types/content'

export type NavLeaf = {
  label: string
  href: string
}

export type NavGroup = {
  label: string
  href: string
  children: NavLeaf[]
}

/** Builds the nav-group shape (used by header/footer) from live catalog data. */
export function toNavGroups(categories: Category[]): NavGroup[] {
  return categories.map((category) => ({
    label: category.label,
    href: categoryHref(category),
    children: category.models.map((model) => ({
      label: model.label,
      href: modelHref(category, model),
    })),
  }))
}
