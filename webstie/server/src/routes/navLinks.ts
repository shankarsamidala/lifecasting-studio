import { prisma } from '../db.js'
import { createOrderedResourceRouter } from './orderedResource.js'

export const navLinksRouter = createOrderedResourceRouter(prisma.navLink)
