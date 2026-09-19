import { verifyAccessToken } from '@/lib/jwt.js'
import { createMiddleware } from 'hono/factory'

export type AuthEnv = {
  Variables: { userId: string }
}

export const authMiddleware = createMiddleware<AuthEnv>(async (c, next) => {
  const auth = c.req.header('Authorization')

  if (!auth?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  let userId: string
  try {
    const token = auth.slice(7)
    const payload = await verifyAccessToken(token)
    userId = payload.userId
  } catch {
    return c.json({ error: 'Invalid or expired token' }, 401)
  }

  c.set('userId', userId)
  await next()
})
