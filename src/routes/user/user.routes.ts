// import { authMiddleware } from '@/middleware/auth'
import { authMiddleware } from '@/middleware/auth.middleware.js'
import { profileRoute } from '@/routes/user/profile.route.js'
import { Hono } from 'hono'

export const userRoute = new Hono()
userRoute.use(authMiddleware)
userRoute.route('/profile', profileRoute)
