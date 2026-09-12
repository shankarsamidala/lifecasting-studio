import { Router } from 'express'
import { requireAuth } from '../auth.js'
import { prisma } from '../db.js'

type Delegate = {
  findMany: (args: unknown) => Promise<unknown[]>
  create: (args: unknown) => Promise<unknown>
  update: (args: unknown) => Promise<unknown>
  delete: (args: unknown) => Promise<unknown>
  count: (args: unknown) => Promise<number>
}

/**
 * Builds a public GET (list, ordered by position) + admin-only POST/PATCH/DELETE
 * router for a simple flat resource (HeroImage, GalleryImage, Testimonial, Faq,
 * NavLink). All five share the same shape: a `position` int for ordering and no
 * relations, so the CRUD logic is identical — this avoids five near-duplicate
 * route files.
 */
export function createOrderedResourceRouter(delegate: Delegate) {
  const router = Router()

  router.get('/', async (_req, res) => {
    const items = await delegate.findMany({ orderBy: { position: 'asc' } })
    res.json(items)
  })

  router.post('/', requireAuth, async (req, res) => {
    const count = await delegate.count({})
    const created = await delegate.create({
      data: { ...req.body, position: req.body.position ?? count },
    })
    res.status(201).json(created)
  })

  router.patch('/:id', requireAuth, async (req, res) => {
    const { id: _id, ...data } = req.body ?? {}
    const updated = await delegate.update({ where: { id: req.params.id }, data })
    res.json(updated)
  })

  router.delete('/:id', requireAuth, async (req, res) => {
    await delegate.delete({ where: { id: req.params.id } })
    res.status(204).end()
  })

  return router
}

export { prisma }
