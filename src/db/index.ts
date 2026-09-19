import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { relations } from '@/db/relations.js'
import { env } from '@/env.js'

const g = global as typeof globalThis & { pool?: Pool }

g.pool ??= new Pool({ connectionString: env.DATABASE_URL })

export const db = drizzle({ client: g.pool, relations })

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0]
