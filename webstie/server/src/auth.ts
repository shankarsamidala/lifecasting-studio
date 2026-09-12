import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import type { NextFunction, Request, Response } from 'express'
import { prisma } from './db.js'

const SESSION_COOKIE = 'admin_session'
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET ?? 'dev-only-secret'
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

function sign(value: string): string {
  const hmac = crypto.createHmac('sha256', SESSION_SECRET).update(value).digest('hex')
  return `${value}.${hmac}`
}

function verify(signed: string): string | null {
  const separatorIndex = signed.lastIndexOf('.')
  if (separatorIndex === -1) return null
  const value = signed.slice(0, separatorIndex)
  const expected = sign(value)
  if (expected.length !== signed.length) return null
  const ok = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signed))
  return ok ? value : null
}

export function createSessionCookieValue(username: string): string {
  const expiresAt = Date.now() + SESSION_TTL_MS
  return sign(`${username}|${expiresAt}`)
}

function readSession(cookieValue: string | undefined): { username: string } | null {
  if (!cookieValue) return null
  const value = verify(cookieValue)
  if (!value) return null
  const [username, expiresAtRaw] = value.split('|')
  const expiresAt = Number(expiresAtRaw)
  if (!username || Number.isNaN(expiresAt) || Date.now() > expiresAt) return null
  return { username }
}

export function setSessionCookie(res: Response, username: string) {
  res.cookie(SESSION_COOKIE, createSessionCookieValue(username), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_TTL_MS,
  })
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE)
}

export async function verifyPassword(username: string, password: string): Promise<boolean> {
  const user = await prisma.adminUser.findUnique({ where: { username } })
  if (!user) return false
  return bcrypt.compare(password, user.passwordHash)
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const session = readSession(req.cookies?.[SESSION_COOKIE])
  if (!session) {
    res.status(401).json({ error: 'Not authenticated' })
    return
  }
  next()
}

export function getSessionUser(req: Request): { username: string } | null {
  return readSession(req.cookies?.[SESSION_COOKIE])
}

export { SESSION_COOKIE }
