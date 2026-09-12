import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { DesktopNav } from './DesktopNav'
import { MobileDrawer } from './MobileDrawer'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const openButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isMenuOpen) {
      closeButtonRef.current?.focus()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  useEffect(() => {
    if (!isMenuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
        openButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isMenuOpen])

  const closeMenu = () => {
    setIsMenuOpen(false)
    openButtonRef.current?.focus()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-ink-900/10 bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:px-6">
        <button
          ref={openButtonRef}
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-text lg:hidden"
          aria-label="Open navigation menu"
          aria-controls="mobile-nav-drawer"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen(true)}
        >
          <svg width="20" height="16" viewBox="0 0 20 16" fill="none" aria-hidden="true">
            <path d="M0 1h20M0 8h20M0 15h20" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>

        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 no-underline lg:mr-2"
        >
          <img src="/logo.png" alt="" className="h-9 w-auto sm:h-10" />
          <span className="font-display text-xl font-semibold tracking-tight text-text sm:text-2xl">
            Lifecasting Studio
          </span>
        </Link>

        <DesktopNav />

        <div className="ml-auto shrink-0">
          <a href="/book" className="btn-primary hidden no-underline lg:inline-flex">
            Book a Session
          </a>
        </div>
      </div>

      <MobileDrawer isOpen={isMenuOpen} onClose={closeMenu} closeButtonRef={closeButtonRef} />
    </header>
  )
}
