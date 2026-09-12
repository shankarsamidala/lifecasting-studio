import { CategoryCircles } from '../components/Home/CategoryCircles'
import { Faq } from '../components/Home/Faq'
import { GalleryCarousel } from '../components/Home/GalleryCarousel'
import { Testimonials } from '../components/Home/Testimonials'
import { SectionTitle } from '../components/Section/SectionTitle'

export function Home() {
  return (
    <>
      <GalleryCarousel />
      <SectionTitle title="Shop by Category" />
      <CategoryCircles />
      <SectionTitle title="Client Stories" />
      <Testimonials />
      <SectionTitle title="Frequently Asked Questions" />
      <Faq />
    </>
  )
}
