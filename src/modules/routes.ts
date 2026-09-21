import { authRoute } from '@/modules/auth/auth.route.js'
import { userRoute } from '@/modules/user/user.route.js'
import { workspaceRoute } from '@/modules/workspace/workspace.route.js'
import { Hono } from 'hono'

export const appRoute = new Hono()

appRoute.route('/auth', authRoute)
appRoute.route('/user', userRoute)
appRoute.route('/workspace/:workspaceId', workspaceRoute)
