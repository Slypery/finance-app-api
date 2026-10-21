import { db } from '@/db/index.js'
import { userWorkspaces, workspaces, type Users, type Workspaces } from '@/db/schema.js'
import { AppError } from '@/errors/app.error.js'
import { and, eq, isNull, ne, sql } from 'drizzle-orm'

export async function getUserWorkspaces(userId: string) {
  const workspaces = await db.query.workspaces.findMany({
    where: {
      users: { id: userId },
      deletedAt: { isNull: true },
    },
  })

  return workspaces
}

type CreateNewWorkspaceInput = {
  name: Workspaces['name']
  description: Workspaces['description']
  ownerUserId: Users['id']
}

export async function createUserWorkspace({
  name,
  description,
  ownerUserId,
}: CreateNewWorkspaceInput) {
  const existingName = await db.query.workspaces.findFirst({
    where: { name: name, ownerUserId: ownerUserId },
  })

  if (existingName)
    throw new AppError(
      `Workspace with the name: "${name}" already exist`,
      409,
      'WORKSPACE_NAME_ALREADY_EXIST'
    )

  return await db.transaction(async (tx) => {
    const [workspace] = await tx
      .insert(workspaces)
      .values({
        name,
        description,
        ownerUserId: ownerUserId,
        createdBy: ownerUserId,
        updatedBy: ownerUserId,
      })
      .returning({
        id: workspaces.id,
        name: workspaces.name,
        description: workspaces.description,
      })

    await tx.insert(userWorkspaces).values({
      workspaceId: workspace.id,
      userId: ownerUserId,
      permissions: ['*'],
      createdBy: ownerUserId,
      updatedBy: ownerUserId,
    })

    return workspace
  })
}

type EditWorkspaceInput = {
  workspaceId: Workspaces['id']
  name?: Workspaces['name']
  description?: Workspaces['description']
  ownerUserId: Users['id']
}

export async function editUserWorkspace({
  workspaceId,
  name,
  description,
  ownerUserId,
}: EditWorkspaceInput) {
  const exist = await db.query.workspaces.findFirst({
    where: { id: workspaceId, ownerUserId: ownerUserId, deletedAt: { isNull: true } },
  })

  if (!exist) throw new AppError('Workspace Not Found', 404, 'WORKSPACE_NOT_FOUND')

  if (name) {
    const existingName = await db.query.workspaces.findFirst({
      where: { name: name, ownerUserId: ownerUserId, id: { ne: workspaceId } },
    })

    if (existingName)
      throw new AppError(
        `Workspace with the name: "${name}" already exist`,
        409,
        'WORKSPACE_NAME_ALREADY_EXIST'
      )
  }

  const [workspace] = await db
    .update(workspaces)
    .set({
      name,
      description,
      updatedAt: sql`now()`,
      updatedBy: ownerUserId,
    })
    .where(
      and(
        eq(workspaces.id, workspaceId),
        eq(workspaces.ownerUserId, ownerUserId),
        isNull(workspaces.deletedAt)
      )
    )
    .returning({
      id: workspaces.id,
      name: workspaces.name,
      description: workspaces.description,
    })

  if (!workspace) throw new AppError('Workspace Not Found', 404, 'WORKSPACE_NOT_FOUND')

  return workspace
}

type DeleteWorkspaceInput = {
  workspaceId: Workspaces['id']
  ownerUserId: Users['id']
}

export async function deleteUserWorkspace({ workspaceId, ownerUserId }: DeleteWorkspaceInput) {
  const exist = await db.query.workspaces.findFirst({
    where: { id: workspaceId, ownerUserId: ownerUserId, deletedAt: { isNull: true } },
  })

  if (!exist) throw new AppError('Workspace Not Found', 404, 'WORKSPACE_NOT_FOUND')

  const [workspace] = await db
    .update(workspaces)
    .set({
      name: sql`${workspaces.name} || '-' || ${workspaces.id}`,
      deletedAt: sql`now()`,
      deletedBy: ownerUserId,
    })
    .where(
      and(
        eq(workspaces.id, workspaceId),
        eq(workspaces.ownerUserId, ownerUserId),
        isNull(workspaces.deletedAt)
      )
    )
    .returning({ id: workspaces.id })

  if (!workspace) throw new AppError('Workspace Not Found', 404, 'WORKSPACE_NOT_FOUND')

  return true
}
