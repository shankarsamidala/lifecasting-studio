import { prisma } from '../db.js'
import { createOrderedResourceRouter } from './orderedResource.js'

export const galleryRouter = createOrderedResourceRouter(prisma.galleryImage)
