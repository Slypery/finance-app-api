import { workspaceMiddleware, type WorkspaceEnv } from '@/middleware/workspace.middleware.js'
import { Hono } from 'hono'

export const accountRoute = new Hono<WorkspaceEnv>()
accountRoute.use(workspaceMiddleware)
accountRoute.post('/', async (c) => c.json({}))
