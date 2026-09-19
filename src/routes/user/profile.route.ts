import { db } from '@/db/index.js'
import type { AuthEnv } from '@/middleware/auth.middleware.js'
import { Hono } from 'hono'

export const profileRoute = new Hono<AuthEnv>()

profileRoute.get('/', async (c) => {
  const userId = c.get('userId')

  const user = await db.query.users.findFirst({
    where: { id: userId },
    columns: {
      id: true,
      username: true,
      email: true,
      displayName: true,
      createdAt: true,
    },
  })

  return c.json({ sucess: true, data: user })
})
