import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { relations } from '@/db/relations.js'
import { DATABASE_URL } from '@/env.js'

const g = global as typeof globalThis & { pool?: Pool }

g.pool ??= new Pool({ connectionString: DATABASE_URL })

export const db = drizzle({ client: g.pool, relations })
