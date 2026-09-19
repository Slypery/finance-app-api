import { verifyAccessToken } from '@/lib/jwt.js'
import { createMiddleware } from 'hono/factory'

export const authMiddleware = createMiddleware<{
  Variables: { userId: string }
}>(async (c, next) => {
  const auth = c.req.header('Authorization')

  if (!auth?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const token = auth.slice(7)
    const payload = await verifyAccessToken(token)

    c.set('userId', payload.userId)

    await next()
  } catch {
    return c.json({ error: 'Invalid or expired token' }, 401)
  }
})