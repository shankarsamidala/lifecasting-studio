import { Link } from 'react-router-dom'
import type { NavGroup } from './nav-data'

type MobileNavAccordionItemProps = {
  navGroup: NavGroup
  isExpanded: boolean
  onToggle: () => void
  onLinkClick: () => void
  showViewAll?: boolean
}

export function MobileNavAccordionItem({
  navGroup,
  isExpanded,
  onToggle,
  onLinkClick,
  showViewAll = true,
}: MobileNavAccordionItemProps) {
  const panelId = `mobile-group-${navGroup.href}`

  return (
    <li className="border-b border-ink-900/5 last:border-b-0">
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-lg bg-transparent px-3 py-3 text-left font-sans text-base font-medium text-text"
        aria-expanded={isExpanded}
        aria-controls={panelId}
        onClick={onToggle}
      >
        {navGroup.label}
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          aria-hidden="true"
          className={`shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        >
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      {isExpanded && (
        <ul id={panelId} role="list" className="m-0 flex list-none flex-col gap-1 px-3 pb-3">
          {showViewAll && (
            <li>
              <Link
                to={navGroup.href}
                className="block rounded-lg px-3 py-2 font-sans text-sm font-medium text-primary no-underline hover:bg-surface-alt"
                onClick={onLinkClick}
              >
                View all {navGroup.label}
              </Link>
            </li>
          )}
          {navGroup.children.map((child) => (
            <li key={child.href}>
              <Link
                to={child.href}
                className="block rounded-lg px-3 py-2 font-sans text-sm text-text-muted no-underline hover:bg-surface-alt"
                onClick={onLinkClick}
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}
