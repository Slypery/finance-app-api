import { AppError } from '@/errors/app.error.js'
import type { AuthEnv } from '@/middleware/auth.middleware.js'
import { requireMembership } from '@/modules/membership/membership.service.js'
import { createMiddleware } from 'hono/factory'
import z from 'zod'

export type WorkspaceEnv = {
  Variables: AuthEnv['Variables'] & {
    workspace: { id: string; permissions: unknown }
  }
}

const workspaceIdSchema = z.uuid()

export const workspaceMiddleware = createMiddleware<WorkspaceEnv>(async (c, next) => {
  const userId = c.get('userId')
  if (!userId) {
    throw new Error('workspaceMiddleware ran without authMiddleware')
  }

  const parsed = workspaceIdSchema.safeParse(c.req.param('workspaceId'))
  if (!parsed.success) throw new AppError('Workspace not found', 404, 'WORKSPACE_NOT_FOUND')

  const membership = await requireMembership(userId, parsed.data)

  c.set('workspace', { id: membership.workspaceId, permissions: membership.permissions })
  await next()
})
