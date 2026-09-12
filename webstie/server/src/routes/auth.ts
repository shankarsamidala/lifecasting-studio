import { Router } from 'express'
import { clearSessionCookie, getSessionUser, setSessionCookie, verifyPassword } from '../auth.js'

export const authRouter = Router()

authRouter.post('/login', async (req, res) => {
  const { username, password } = req.body ?? {}
  if (typeof username !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'Username and password are required' })
    return
  }

  const ok = await verifyPassword(username, password)
  if (!ok) {
    res.status(401).json({ error: 'Invalid username or password' })
    return
  }

  setSessionCookie(res, username)
  res.json({ username })
})

authRouter.post('/logout', (_req, res) => {
  clearSessionCookie(res)
  res.status(204).end()
})

authRouter.get('/me', (req, res) => {
  const session = getSessionUser(req)
  if (!session) {
    res.status(401).json({ error: 'Not authenticated' })
    return
  }
  res.json(session)
})
