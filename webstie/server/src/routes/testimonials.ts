import { prisma } from '../db.js'
import { createOrderedResourceRouter } from './orderedResource.js'

export const testimonialsRouter = createOrderedResourceRouter(prisma.testimonial)
