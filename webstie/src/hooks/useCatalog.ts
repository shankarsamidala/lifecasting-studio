import { useFetch } from './useFetch'
import type { Category } from '../types/content'

export function useCatalog() {
  return useFetch<Category[]>('/categories')
}

export function useCategory(categorySlug: string | undefined) {
  const { data: categories, loading, error } = useCatalog()
  const category = categorySlug ? categories?.find((entry) => entry.slug === categorySlug) : undefined
  return { category, categories, loading, error }
}
