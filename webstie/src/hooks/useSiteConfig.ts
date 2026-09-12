import { useFetch } from './useFetch'
import type { FooterSettings, NavLink, SiteSettings } from '../types/content'
import type { NavGroup } from '../components/Header/nav-data'

export function useFooterSettings() {
  return useFetch<FooterSettings>('/footer')
}

export function useSiteSettings() {
  return useFetch<SiteSettings>('/settings')
}

export function useNavLinks() {
  return useFetch<NavLink[]>('/nav-links')
}

/** The "Customer Service" nav dropdown, sourced from admin-editable NavLink rows. */
export function useCustomerServiceGroup(): NavGroup {
  const { data: links } = useNavLinks()
  const children = (links ?? []).filter((link) => link.group === 'customer-service')
  return {
    label: 'Customer Service',
    href: children[0]?.href ?? '/pages/shipping-policy',
    children: children.map((link) => ({ label: link.label, href: link.href })),
  }
}
