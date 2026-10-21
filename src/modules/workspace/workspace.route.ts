import { authMiddleware, type AuthEnv } from '@/middleware/auth.middleware.js'
import {
  createUserWorkspace,
  deleteUserWorkspace,
  editUserWorkspace,
  getUserWorkspaces,
} from '@/modules/workspace/workspace.service.js'
import { sValidator } from '@hono/standard-validator'
import { Hono } from 'hono'
import { createWorkspaceSchema, patchWorkspaceSchema } from './workspace.schema.js'

export const workspaceRoute = new Hono<AuthEnv>()
workspaceRoute.use(authMiddleware)

workspaceRoute.get('/', async (c) => {
  const result = await getUserWorkspaces(c.get('userId'))

  return c.json({ success: true, data: result })
})

workspaceRoute.post('/', sValidator('json', createWorkspaceSchema), async (c) => {
  const { name, description } = c.req.valid('json')
  const result = await createUserWorkspace({ name, description, ownerUserId: c.get('userId') })

  return c.json({ success: true, data: result })
})

workspaceRoute.patch('/:workspaceId', sValidator('json', patchWorkspaceSchema), async (c) => {
  const { name, description } = c.req.valid('json')
  const workspaceId = c.req.param('workspaceId')

  const result = await editUserWorkspace({
    workspaceId,
    ownerUserId: c.get('userId'),
    name,
    description,
  })

  return c.json({ success: true, data: result })
})

workspaceRoute.delete('/:workspaceId', async (c) => {
  const workspaceId = c.req.param('workspaceId')
  await deleteUserWorkspace({ workspaceId, ownerUserId: c.get('userId') })

  return c.json({ success: true })
})
