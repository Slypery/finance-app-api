import { authRoute } from '@/modules/auth/auth.route.js'
import { meRoute } from '@/modules/me/me.route.js'
import { workspaceRoute } from '@/modules/workspace/workspace.route.js'
import { Hono } from 'hono'

export const appRoute = new Hono()

appRoute.route('/auth', authRoute)
appRoute.route('/me', meRoute)
appRoute.route('/workspaces/:workspaceId', workspaceRoute)
