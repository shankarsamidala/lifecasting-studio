import { Router } from 'express'
import { requireAuth } from '../auth.js'
import { prisma } from '../db.js'

export const footerRouter = Router()

footerRouter.get('/', async (_req, res) => {
  const settings = await prisma.footerSettings.findUnique({ where: { id: 'singleton' } })
  res.json(settings)
})

footerRouter.put('/', requireAuth, async (req, res) => {
  const { id: _id, ...data } = req.body ?? {}
  const updated = await prisma.footerSettings.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', ...data },
    update: data,
  })
  res.json(updated)
})
