import { env } from './src/env'
import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'
export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
})
