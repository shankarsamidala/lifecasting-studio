import { Router } from 'express'
import { requireAuth } from '../auth.js'
import { prisma } from '../db.js'

export const productsRouter = Router()

// Flat product list with category attached — the Django-admin-style "Products" table.
productsRouter.get('/', async (_req, res) => {
  const models = await prisma.model.findMany({
    orderBy: [{ categoryId: 'asc' }, { position: 'asc' }],
    include: { category: { select: { id: true, label: true, slug: true } } },
  })
  res.json(models)
})

productsRouter.get('/:id', async (req, res) => {
  const model = await prisma.model.findUnique({
    where: { id: req.params.id },
    include: { category: { select: { id: true, label: true, slug: true } } },
  })
  if (!model) {
    res.status(404).json({ error: 'Product not found' })
    return
  }
  res.json(model)
})

productsRouter.post('/', requireAuth, async (req, res) => {
  const { categoryId, ...data } = req.body ?? {}
  if (!categoryId) {
    res.status(400).json({ error: 'categoryId is required' })
    return
  }
  const count = await prisma.model.count({ where: { categoryId } })
  const created = await prisma.model.create({
    data: { ...data, categoryId, position: data.position ?? count },
  })
  res.status(201).json(created)
})

productsRouter.patch('/:id', requireAuth, async (req, res) => {
  const { id: _id, category: _category, ...data } = req.body ?? {}
  const updated = await prisma.model.update({ where: { id: req.params.id }, data })
  res.json(updated)
})

productsRouter.delete('/:id', requireAuth, async (req, res) => {
  await prisma.model.delete({ where: { id: req.params.id } })
  res.status(204).end()
})
