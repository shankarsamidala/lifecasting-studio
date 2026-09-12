import { Router } from 'express'
import multer from 'multer'
import { requireAuth } from '../auth.js'
import { storage } from '../storage.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image uploads are allowed'))
      return
    }
    cb(null, true)
  },
})

export const uploadsRouter = Router()

uploadsRouter.post('/', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' })
    return
  }
  const url = await storage.save(req.file.originalname, req.file.buffer)
  res.status(201).json({ url })
})
