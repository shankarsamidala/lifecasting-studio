import { Router } from 'express'
import { requireAuth } from '../auth.js'
import { prisma } from '../db.js'

export const settingsRouter = Router()

settingsRouter.get('/', async (_req, res) => {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } })
  res.json(settings)
})

settingsRouter.put('/', requireAuth, async (req, res) => {
  const { id: _id, ...data } = req.body ?? {}
  const updated = await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', ...data },
    update: data,
  })
  res.json(updated)
})
