import { useState } from 'react'
import { toNavGroups } from './nav-data'
import { MobileNavAccordionItem } from './MobileNavAccordionItem'
import { useCatalog } from '../../hooks/useCatalog'
import { useCustomerServiceGroup } from '../../hooks/useSiteConfig'

type MobileDrawerProps = {
  isOpen: boolean
  onClose: () => void
  closeButtonRef: React.RefObject<HTMLButtonElement | null>
}

export function MobileDrawer({ isOpen, onClose, closeButtonRef }: MobileDrawerProps) {
  const { data: categories } = useCatalog()
  const navGroups = toNavGroups(categories ?? [])
  const customerServiceGroup = useCustomerServiceGroup()
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)

  const toggleGroup = (href: string) =>
    setExpandedGroup((current) => (current === href ? null : href))

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-ink-900/40 transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <nav
        id="mobile-nav-drawer"
        aria-label="Primary"
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-80 max-w-[85vw] flex-col bg-surface shadow-xl transition-transform duration-300 ease-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-ink-900/10 px-5 py-4">
          <span className="font-display text-lg font-semibold text-text">Menu</span>
          <button
            ref={closeButtonRef}
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-text"
            aria-label="Close navigation menu"
            onClick={onClose}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M1 1l14 14M15 1L1 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <ul
          role="list"
          className="m-0 flex min-h-0 flex-1 list-none flex-col gap-1 overflow-y-auto p-4 [-webkit-overflow-scrolling:touch]"
        >
          {navGroups.map((navGroup) => (
            <MobileNavAccordionItem
              key={navGroup.href}
              navGroup={navGroup}
              isExpanded={expandedGroup === navGroup.href}
              onToggle={() => toggleGroup(navGroup.href)}
              onLinkClick={onClose}
            />
          ))}

          <MobileNavAccordionItem
            navGroup={customerServiceGroup}
            isExpanded={expandedGroup === customerServiceGroup.href}
            onToggle={() => toggleGroup(customerServiceGroup.href)}
            onLinkClick={onClose}
            showViewAll={false}
          />
        </ul>

        <div className="shrink-0 border-t border-ink-900/10 p-4">
          <a href="/book" className="btn-primary block text-center no-underline">
            Book a Session
          </a>
        </div>
      </nav>
    </>
  )
}
