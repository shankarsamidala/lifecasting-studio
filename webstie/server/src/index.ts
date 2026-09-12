import cookieParser from 'cookie-parser'
import express from 'express'
import { UPLOADS_DIR } from './storage.js'
import { authRouter } from './routes/auth.js'
import { categoriesRouter } from './routes/categories.js'
import { faqsRouter } from './routes/faqs.js'
import { footerRouter } from './routes/footer.js'
import { galleryRouter } from './routes/gallery.js'
import { heroRouter } from './routes/hero.js'
import { navLinksRouter } from './routes/navLinks.js'
import { productsRouter } from './routes/products.js'
import { settingsRouter } from './routes/settings.js'
import { testimonialsRouter } from './routes/testimonials.js'
import { uploadsRouter } from './routes/uploads.js'

const app = express()
const port = Number(process.env.PORT ?? 4000)

app.use(express.json())
app.use(cookieParser())
app.use('/uploads', express.static(UPLOADS_DIR))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api/auth', authRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/hero', heroRouter)
app.use('/api/gallery', galleryRouter)
app.use('/api/testimonials', testimonialsRouter)
app.use('/api/faqs', faqsRouter)
app.use('/api/nav-links', navLinksRouter)
app.use('/api/products', productsRouter)
app.use('/api/footer', footerRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/uploads', uploadsRouter)

app.listen(port, () => {
  console.log(`Admin API listening on http://localhost:${port}`)
})
