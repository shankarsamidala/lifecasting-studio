import { prisma } from '../db.js'
import { createOrderedResourceRouter } from './orderedResource.js'

export const heroRouter = createOrderedResourceRouter(prisma.heroImage)
