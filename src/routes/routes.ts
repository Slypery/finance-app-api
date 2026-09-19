import { authRoute } from '@/routes/auth.route.js'
import { userRoute } from '@/routes/user/user.routes.js'
import { workspaceRoute } from '@/routes/workspace/workspace.routes.js'
import { Hono } from 'hono'

export const appRoute = new Hono()

appRoute.route('/auth', authRoute)
appRoute.route('/user', userRoute)
appRoute.route('/workspace/:workspaceId', workspaceRoute)
