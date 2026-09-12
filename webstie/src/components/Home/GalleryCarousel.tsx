import { Link } from 'react-router-dom'
import { useHeroImages } from '../../hooks/useHomepageContent'
import { useCatalog } from '../../hooks/useCatalog'
import { categoryHref } from '../../types/content'
import { Section } from '../Section/Section'

export function GalleryCarousel() {
  const { data: heroImages } = useHeroImages()
  const { data: categories } = useCatalog()
  const babyCastingHref = categories?.[0] ? categoryHref(categories[0]) : '/'

  if (!heroImages || heroImages.length === 0) return null

  return (
    <Section bleed topSpacing="tight" bottomSpacing="none">
      <ul
        role="list"
        className="m-0 flex list-none snap-x snap-mandatory gap-2 overflow-x-auto p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {heroImages.map((image) => (
          <li key={image.id} className="w-[75vw] shrink-0 snap-start sm:w-[55vw] lg:w-[42vw]">
            <Link to={babyCastingHref}>
              <img
                src={image.src}
                alt={image.title}
                loading="lazy"
                className="aspect-[4/3] h-full w-full object-cover"
              />
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  )
}
