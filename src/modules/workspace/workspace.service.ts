import { db } from '@/db/index.js'

export async function getUserWorkspaces(userId: string, workspaceId?: string) {
  const workspaces = await db.query.workspaces.findMany({
    where: {
      users: { id: userId },
      ...(workspaceId ? { workspaceId } : {}),
    },
  })

  return workspaces
}
