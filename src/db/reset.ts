import { db } from '@/db/index.js'
import { sql } from 'drizzle-orm'

await db.execute(sql`DROP SCHEMA public CASCADE`)
await db.execute(sql`CREATE SCHEMA public`)
