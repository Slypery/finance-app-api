import { db } from '@/db/index.js';
import type { UserVariables } from '@/routes/user/index.route.js';
import { Hono } from 'hono';

export const profileRoute = new Hono<{ Variables: UserVariables }>()

profileRoute.get('/', async (c) => {
  const userId = c.get('userId')

  const user = await db.query.users.findFirst({
    where: {id: userId},
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