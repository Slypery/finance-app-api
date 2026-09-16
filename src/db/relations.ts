import { defineRelations } from 'drizzle-orm'
import * as schema from '@/db/schema.js'

export const relations = defineRelations(schema, (r) => ({}))
