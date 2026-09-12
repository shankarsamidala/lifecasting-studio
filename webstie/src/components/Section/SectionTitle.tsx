type SectionTitleProps = {
  title: string
  align?: 'left' | 'center'
}

/**
 * A title that sits BETWEEN two sections, with its own fixed spacing —
 * independent of whichever Section comes before or after it.
 */
export function SectionTitle({ title, align = 'center' }: SectionTitleProps) {
  return (
    <div className="bg-surface py-10 sm:py-12 lg:py-14">
      <header
        className={`mx-auto max-w-7xl px-4 sm:px-6 ${
          align === 'center' ? 'text-center' : 'text-left'
        }`}
      >
        <h2>{title}</h2>
      </header>
    </div>
  )
}
