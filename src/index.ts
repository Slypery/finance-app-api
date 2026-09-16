import { PORT } from '@/env.js'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { appendFile, mkdir } from 'node:fs/promises'
import { AppError } from './errors/app.error.js'
import { db } from '@/db/index.js'
import { users } from '@/db/schema.js'

const app = new Hono()

app.use(logger())

async function writeErrorLog(err: Error) {
  const log = `[${new Date().toISOString()}] ${err.stack ?? err.message}\n`
  await mkdir('logs', { recursive: true })
  await appendFile('logs/error.log', log)
}

app.onError((err, c) => {
  if (err instanceof AppError) {
    return c.json({ success: false, code: err.code, error: err.message }, err.statusCode)
  }

  writeErrorLog(err)
  return c.json({ error: 'Internal Server Error' }, 500)
})

app.get('/', async (c) => {
  // return c.text('Hello Hono!')
  await db.insert(users).values({username: 'admin', email: 'admin@mail.com', passwordHash: '', displayName: 'admin'})
  return c.json(await db.select().from(users))
})

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  }
)
