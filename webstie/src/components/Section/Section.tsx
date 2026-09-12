import type { ReactNode } from 'react'

type SpacingVariant = 'default' | 'tight' | 'none'

type SectionProps = {
  /**
   * 'bleed' removes the horizontal container padding so content (e.g. an
   * edge-to-edge carousel) can touch the viewport edges. Vertical rhythm
   * stays identical to a normal section either way.
   */
  bleed?: boolean
  /**
   * Top spacing variant. 'tight' — for a section sitting directly under the
   * sticky header, where the full top rhythm would read as a gap. 'none' —
   * no top spacing at all. Defaults to 'default'.
   */
  topSpacing?: SpacingVariant
  /**
   * Bottom spacing variant. 'tight' or 'none' — for a section immediately
   * followed by another section that already provides its own leading gap
   * (e.g. a SectionTitle). Defaults to 'default'.
   */
  bottomSpacing?: SpacingVariant
  className?: string
  children: ReactNode
}

const TOP_SPACING: Record<SpacingVariant, string> = {
  default: 'pt-8 sm:pt-10 lg:pt-12',
  tight: 'pt-3 sm:pt-4',
  none: 'pt-0',
}

const BOTTOM_SPACING: Record<SpacingVariant, string> = {
  default: 'pb-8 sm:pb-10 lg:pb-12',
  tight: 'pb-3 sm:pb-4',
  none: 'pb-0',
}

/**
 * Shared vertical rhythm + container for a home-page section's content.
 * A section's title is NOT part of this box — use <SectionTitle> between
 * sections instead, so a title's spacing is independent of either
 * neighbor's own top/bottom spacing. Change the scale here once instead
 * of per-section.
 */
export function Section({
  bleed = false,
  topSpacing = 'default',
  bottomSpacing = 'default',
  className = '',
  children,
}: SectionProps) {
  return (
    <section
      className={`bg-surface ${TOP_SPACING[topSpacing]} ${BOTTOM_SPACING[bottomSpacing]} ${className}`}
    >
      <div className={bleed ? '' : 'mx-auto max-w-7xl px-4 sm:px-6'}>{children}</div>
    </section>
  )
}
