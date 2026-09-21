import { authMiddleware } from '@/middleware/auth.middleware.js'
import { workspaceMiddleware, type WorkspaceEnv } from '@/middleware/workspace.middleware.js'
import { Hono } from 'hono'

export const workspaceRoute = new Hono<WorkspaceEnv>()
workspaceRoute.use(authMiddleware)
workspaceRoute.use(workspaceMiddleware)

workspaceRoute.get('/', async (c) => c.json({ test: 'test' }))
