import type { InferSelectModel } from 'drizzle-orm'
import * as p from 'drizzle-orm/pg-core'

// #region custom helpers

const c = {
  timestampz: (
    fieldName?: string,
    config: p.PgTimestampConfig<'string' | 'date'> | undefined = { withTimezone: true }
  ) => {
    if (fieldName !== undefined) {
      return p.timestamp(fieldName, config)
    }
    return p.timestamp(config)
  },

  idPrimaryKey: () => {
    return p.bigint({ mode: 'string' }).primaryKey().generatedAlwaysAsIdentity()
  },

  idForeignKey: (
    fieldName?: string,
    config: p.PgBigIntConfig<'string'> | undefined = { mode: 'string' }
  ) => {
    if (fieldName !== undefined) {
      return p.bigint(fieldName, config)
    }
    return p.bigint(config)
  },

  index: (tableName: string, ...columns: p.PgColumn[]) => {
    if (columns.length === 0) throw new Error('refIndex requires at least one column')
    return p
      .index(`${tableName}_${columns.map((c) => c.name).join('_')}_idx`)
      .on(...(columns as [p.PgColumn, ...p.PgColumn[]]))
  },

  uniqueIndex: (tableName: string, ...columns: p.PgColumn[]) => {
    if (columns.length === 0) throw new Error('refIndex requires at least one column')
    return p
      .uniqueIndex(`${tableName}_${columns.map((c) => c.name).join('_')}_unique_idx`)
      .on(...(columns as [p.PgColumn, ...p.PgColumn[]]))
  },
}

// #endregion

// entry type enum
export type EntryType = (typeof entryTypeEnum.enumValues)[number]
export const entryTypeEnum = p.pgEnum('entry_type', ['debit', 'credit'])

// #region Users Table

export type Users = InferSelectModel<typeof users>
export const users = p.snakeCase.table('users', {
  id: c.idPrimaryKey(),
  username: p.text().notNull().unique(),
  email: p.text().notNull().unique(),
  passwordHash: p.text().notNull(),
  displayName: p.text().notNull(),
  emailVerifiedAt: c.timestampz(),
  createdAt: c.timestampz().defaultNow().notNull(),
  updatedAt: c.timestampz().defaultNow().notNull(),
})

const auditColumns = {
  createdAt: c.timestampz().defaultNow().notNull(),
  createdBy: c
    .idForeignKey()
    .references(() => users.id, { onDelete: 'restrict' })
    .notNull(),
  updatedAt: c.timestampz().defaultNow().notNull(),
  updatedBy: c
    .idForeignKey()
    .references(() => users.id, { onDelete: 'restrict' })
    .notNull(),
  deletedAt: c.timestampz().defaultNow(),
  deletedBy: c.idForeignKey().references(() => users.id, { onDelete: 'restrict' }),
}

const auditIndexes = <
  T extends { createdBy: p.PgColumn; updatedBy: p.PgColumn; deletedBy: p.PgColumn },
>(
  tableName: string,
  t: T
) => {
  return [
    c.index(tableName, t.createdBy),
    c.index(tableName, t.updatedBy),
    c.index(tableName, t.deletedBy),
  ]
}

// #endregion

// #region Workspaces Table

export type Workspaces = InferSelectModel<typeof workspaces>
export const workspaces = p.snakeCase.table(
  'workspaces',
  {
    id: c.idPrimaryKey(),
    name: p.text().notNull(),
    description: p.text(),
    ...auditColumns,
  },
  (t) => [...auditIndexes('workspaces', t)]
)

const workspaceRef = c.idForeignKey().references(() => workspaces.id, { onDelete: 'restrict' })

// #endregion

// #region UserWorkspaces Table

export type UserWorkspaces = InferSelectModel<typeof userWorkspaces>
export const userWorkspaces = p.snakeCase.table(
  'user_workspaces',
  {
    id: c.idPrimaryKey(),
    userId: c
      .idForeignKey()
      .references(() => users.id, { onDelete: 'restrict' })
      .notNull(),
    workspaceId: c
      .idForeignKey()
      .references(() => workspaces.id, { onDelete: 'restrict' })
      .notNull(),
    permissions: p.jsonb().default({}).notNull(),
    ...auditColumns,
  },
  (t) => [
    c.uniqueIndex('user_workspaces', t.userId, t.workspaceId),
    c.index('user_workspaces', t.workspaceId, t.userId),
    ...auditIndexes('user_workspaces', t),
  ]
)

// #endregion

// #region Accounts Table

export const accounts = p.snakeCase.table(
  'accounts',
  {
    id: c.idPrimaryKey(),
    workspaceId: workspaceRef.notNull(),
    name: p.text().notNull(),
    numbering: p.integer(),
    currency: p.char({ length: 3 }).notNull(),
    category: p.text(),
    description: p.text(),
    normalBalance: entryTypeEnum().notNull(),
    ...auditColumns,
  },
  (t) => [
    c.uniqueIndex('accounts', t.workspaceId, t.name),
    c.index('accounts', t.workspaceId, t.category),
    c.uniqueIndex('accounts', t.workspaceId, t.numbering),
    ...auditIndexes('accounts', t),
  ]
)

// #endregion

// #region Journal Entries Table

export const journalEntries = p.snakeCase.table(
  'journal_entries',
  {
    id: c.idPrimaryKey(),
    workspaceId: workspaceRef.notNull(),
    transactionDate: p.date().notNull(),
    baseCurrency: p.char({ length: 3 }).notNull(),
    category: p.text(),
    description: p.text(),
    postedAt: c.timestampz(),
    ...auditColumns,
  },
  (t) => [
    c.index('journal_entries', t.workspaceId, t.transactionDate),
    c.index('journal_entries', t.workspaceId, t.category),
    c.index('journal_entries', t.workspaceId, t.postedAt),
    ...auditIndexes('journal_entries', t),
  ]
)

// #endregion

// #region Journal Lines Table

export const journalLines = p.snakeCase.table(
  'journal_lines',
  {
    id: c.idPrimaryKey(),
    workspaceId: workspaceRef.notNull(),
    journalEntryId: c
      .idForeignKey()
      .references(() => journalEntries.id, { onDelete: 'cascade' })
      .notNull(),
    accountId: c
      .idForeignKey()
      .references(() => accounts.id, { onDelete: 'cascade' })
      .notNull(),
    amount: p.numeric({ precision: 19, scale: 4 }).notNull(),
    exchangeRate: p.numeric({ precision: 19, scale: 4 }).notNull(),
    notes: p.text(),
    entryType: entryTypeEnum().notNull(),
    ...auditColumns,
  },
  (t) => [
    c.index('journal_lines', t.accountId),
    c.index('journal_lines', t.journalEntryId),
    ...auditIndexes('journal_lines', t),
  ]
)

// #endregion
