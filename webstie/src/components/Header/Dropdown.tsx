import { useEffect, useRef, useState, type ReactNode } from 'react'

type DropdownProps = {
  label: string
  panelId: string
  children: (close: () => void) => ReactNode
  panelClassName: string
}

export function Dropdown({ label, panelId, children, panelClassName }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen])

  return (
    <li ref={containerRef} className="relative">
      <button
        type="button"
        className="flex items-center gap-1 bg-transparent font-sans text-sm font-medium text-text transition-colors hover:text-primary"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((open) => !open)}
      >
        {label}
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          aria-hidden="true"
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      {isOpen && (
        <div id={panelId} className={panelClassName}>
          {children(() => setIsOpen(false))}
        </div>
      )}
    </li>
  )
}
