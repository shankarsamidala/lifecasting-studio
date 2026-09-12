import { Link } from 'react-router-dom'
import { useGalleryImages } from '../../hooks/useHomepageContent'
import { useCatalog } from '../../hooks/useCatalog'
import { toNavGroups } from '../Header/nav-data'
import { Section } from '../Section/Section'

/**
 * Sample photos standing in for each category until real per-category
 * photography exists (see docs/SPEC.md `catalog-data`).
 *
 * Uses a content-sized flex row (capped at exactly 4 circles wide) instead
 * of a CSS grid: grid columns are equal fractions of the full container,
 * so a circle much narrower than its column leaves large unstyleable
 * whitespace that `gap` can't remove. Capping the row's max-width to
 * "4 circles + 3 gaps" makes the gap the only thing controlling spacing,
 * and it keeps working if the circle size changes later.
 */
export function CategoryCircles() {
  const { data: categories } = useCatalog()
  const { data: galleryImages } = useGalleryImages()
  const navGroups = toNavGroups(categories ?? [])

  if (navGroups.length === 0 || !galleryImages || galleryImages.length === 0) return null

  return (
    <Section topSpacing="none" bottomSpacing="none">
      <ul
        role="list"
        className="m-0 mx-auto flex max-w-[40rem] list-none flex-wrap justify-center gap-x-8 gap-y-12 p-0 sm:max-w-[50rem] sm:gap-x-10 lg:max-w-[58rem]"
      >
        {navGroups.map((navGroup, index) => {
          const sampleImage = galleryImages[index % galleryImages.length]
          return (
            <li key={navGroup.href}>
              <Link
                to={navGroup.href}
                className="group flex flex-col items-center gap-1.5 no-underline"
              >
                <span className="block aspect-square w-32 overflow-hidden rounded-full shadow-md ring-1 ring-ink-900/5 transition-all duration-500 group-hover:scale-105 group-hover:shadow-xl sm:w-40 lg:w-44">
                  <img
                    src={sampleImage.src}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </span>
                <span className="text-center font-sans text-xs leading-tight font-medium text-text transition-colors duration-300 group-hover:text-primary sm:text-sm">
                  {navGroup.label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
