import { env } from '@/env.js'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { AppError } from './errors/app.error.js'
import { writeErrorLog } from '@/logger.js'
import { requestId } from 'hono/request-id'
import { routePath } from 'hono/route'
import { appRoute } from '@/routes/routes.js'

type AppEnv = {
  Variables: {
    userId?: string
    workspace?: { id: string }
  }
}

const app = new Hono<AppEnv>()

app.use(logger())
app.use(requestId())

app.onError((err, c) => {
  if (err instanceof AppError) {
    return c.json({ success: false, code: err.code, error: err.message }, err.statusCode)
  }

  void writeErrorLog(err, {
    requestId: c.get('requestId'),
    method: c.req.method,
    path: routePath(c),
    userId: c.get('userId'),
    workspaceId: c.get('workspace')?.id,
  })
  return c.json({ success: false, code: 'INTERNAL_ERROR', error: 'Internal Server Error' }, 500)
})

app.route('/api', appRoute)

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  }
)
