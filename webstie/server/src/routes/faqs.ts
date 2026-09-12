import { prisma } from '../db.js'
import { createOrderedResourceRouter } from './orderedResource.js'

export const faqsRouter = createOrderedResourceRouter(prisma.faq)
