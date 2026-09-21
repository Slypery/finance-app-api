// import { authMiddleware } from '@/middleware/auth'
import { db } from '@/db/index.js'
import { authMiddleware, type AuthEnv } from '@/middleware/auth.middleware.js'
import { Hono } from 'hono'

export const userRoute = new Hono<AuthEnv>()
userRoute.use(authMiddleware)

userRoute.get('/profile', async (c) => {
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
