import { defineRelations } from 'drizzle-orm'
import * as schema from '@/db/schema.js'

export const relations = defineRelations(schema, (r) => ({
  users: {
    workspaces: r.many.workspaces({
      from: r.users.id.through(r.userWorkspaces.userId),
      to: r.workspaces.id.through(r.userWorkspaces.workspaceId),
    }),
  },
  workspaces: {
    users: r.many.users({
      from: r.workspaces.id.through(r.userWorkspaces.workspaceId),
      to: r.users.id.through(r.userWorkspaces.userId),
    }),
  },
}))
