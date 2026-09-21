import { authMiddleware, type AuthEnv } from '@/middleware/auth.middleware.js'
import { getUserWorkspaces } from '@/modules/workspace/workspace.service.js'
import { Hono } from 'hono'

export const workspaceRoute = new Hono<AuthEnv>()
workspaceRoute.use(authMiddleware)

workspaceRoute.get('/', async (c) => {
  const result = await getUserWorkspaces(c.get('userId'))

  return c.json({ success: true, data: result })
})
