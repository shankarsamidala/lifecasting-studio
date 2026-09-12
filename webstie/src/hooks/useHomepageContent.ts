import { useFetch } from './useFetch'
import type { Faq, GalleryImage, HeroImage, Testimonial } from '../types/content'

export function useHeroImages() {
  return useFetch<HeroImage[]>('/hero')
}

export function useGalleryImages() {
  return useFetch<GalleryImage[]>('/gallery')
}

export function useTestimonials() {
  return useFetch<Testimonial[]>('/testimonials')
}

export function useFaqs() {
  return useFetch<Faq[]>('/faqs')
}
