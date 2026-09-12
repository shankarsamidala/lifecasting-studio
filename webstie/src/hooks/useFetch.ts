import { useEffect, useState } from 'react'
import { api } from '../lib/api'

type FetchState<T> = { data: T | null; loading: boolean; error: string | null }

/**
 * Thin fetch-on-mount hook shared by every public content hook (useCatalog,
 * useHero, etc). Assumes `path` is effectively stable for the component's
 * lifetime — components whose fetch depends on a route param (CategoryPage,
 * ProductPage) are keyed by that param at the route level so a param change
 * remounts the component instead of needing an in-hook reset.
 */
export function useFetch<T>(path: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({ data: null, loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    api
      .get<T>(path)
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({ data: null, loading: false, error: error instanceof Error ? error.message : 'Failed to load' })
        }
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path])

  return state
}
