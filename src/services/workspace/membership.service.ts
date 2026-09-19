import { db } from '@/db/index.js'
import { AppError } from '@/errors/app.error.js'

export async function requireMembership(userId: string, workspaceId: string) {
  const membership = await db.query.userWorkspaces.findFirst({
    where: {
      userId,
      workspaceId,
    },
  })

  if (!membership) throw new AppError('Workspace not found', 404, 'WORKSPACE_NOT_FOUND')
  return membership
}
