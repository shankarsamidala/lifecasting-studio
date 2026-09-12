import { Link } from 'react-router-dom'
import { Dropdown } from './Dropdown'
import { toNavGroups } from './nav-data'
import { useCatalog } from '../../hooks/useCatalog'
import { useCustomerServiceGroup } from '../../hooks/useSiteConfig'

export function DesktopNav() {
  const { data: categories } = useCatalog()
  const navGroups = toNavGroups(categories ?? [])
  const customerServiceGroup = useCustomerServiceGroup()

  return (
    <nav aria-label="Primary" className="hidden flex-1 items-center justify-center lg:flex">
      <ul role="list" className="flex list-none items-center gap-8 p-0">
        <Dropdown
          label="Collections"
          panelId="collections-mega-menu"
          panelClassName="absolute top-full left-1/2 z-50 mt-4 w-[min(90vw,64rem)] -translate-x-1/2 rounded-2xl border border-ink-900/10 bg-surface p-8 shadow-xl"
        >
          {(close) => (
            <div className="grid grid-cols-4 gap-x-8 gap-y-6">
              {navGroups.map((navGroup) => (
                <div key={navGroup.href}>
                  <Link
                    to={navGroup.href}
                    className="font-display text-sm font-semibold text-text no-underline"
                    onClick={close}
                  >
                    {navGroup.label}
                  </Link>
                  <ul role="list" className="m-0 mt-3 flex list-none flex-col gap-2 p-0">
                    {navGroup.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          to={child.href}
                          className="font-sans text-sm text-text-muted no-underline transition-colors hover:text-primary"
                          onClick={close}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </Dropdown>

        <Dropdown
          label={customerServiceGroup.label}
          panelId="customer-service-menu"
          panelClassName="absolute top-full right-0 z-50 mt-4 w-64 rounded-2xl border border-ink-900/10 bg-surface p-3 shadow-xl"
        >
          {(close) => (
            <ul role="list" className="m-0 flex list-none flex-col gap-1 p-0">
              {customerServiceGroup.children.map((child) => (
                <li key={child.href}>
                  <Link
                    to={child.href}
                    className="block rounded-lg px-3 py-2 font-sans text-sm text-text no-underline transition-colors hover:bg-surface-alt hover:text-primary"
                    onClick={close}
                  >
                    {child.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Dropdown>
      </ul>
    </nav>
  )
}
