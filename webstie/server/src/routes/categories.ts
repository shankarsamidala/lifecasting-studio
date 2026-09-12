import { Router } from 'express'
import { requireAuth } from '../auth.js'
import { prisma } from '../db.js'

export const categoriesRouter = Router()

// Public: full catalog (categories + their models), ordered — this is the one
// call the public site needs to render nav, category pages, and product pages.
categoriesRouter.get('/', async (_req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { position: 'asc' },
    include: { models: { orderBy: { position: 'asc' } } },
  })
  res.json(categories)
})

categoriesRouter.get('/:id', async (req, res) => {
  const category = await prisma.category.findUnique({
    where: { id: req.params.id },
    include: { models: { orderBy: { position: 'asc' } } },
  })
  if (!category) {
    res.status(404).json({ error: 'Category not found' })
    return
  }
  res.json(category)
})

categoriesRouter.post('/', requireAuth, async (req, res) => {
  const count = await prisma.category.count()
  const created = await prisma.category.create({
    data: { ...req.body, position: req.body.position ?? count },
  })
  res.status(201).json(created)
})

categoriesRouter.patch('/:id', requireAuth, async (req, res) => {
  const { id: _id, models: _models, ...data } = req.body ?? {}
  const updated = await prisma.category.update({ where: { id: req.params.id }, data })
  res.json(updated)
})

categoriesRouter.delete('/:id', requireAuth, async (req, res) => {
  await prisma.category.delete({ where: { id: req.params.id } })
  res.status(204).end()
})

// Product (Model) CRUD lives in routes/products.ts as its own top-level
// resource with a categoryId field, mirroring how the admin UI manages it
// (a Products table with a Category dropdown) rather than nested here.
