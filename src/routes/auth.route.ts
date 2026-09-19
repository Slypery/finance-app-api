import { Hono } from 'hono'
import { sValidator } from '@hono/standard-validator'
import { registerSchema, loginSchema } from '@/schema/auth.schema.js'
import { registerNewUser } from '@/services/auth/register.service.js'
import { loginUser } from '@/services/auth/login.service.js'
import { getCookie } from 'hono/cookie'
import { refreshAccessToken } from '@/services/auth/refreshToken.service.js'

export const authRoute = new Hono()

authRoute.post('/register', sValidator('json', registerSchema), async (c) => {
  const { username, email, displayName, password } = c.req.valid('json')

  const result = await registerNewUser({ username, email, displayName, password })

  return c.json({ success: true, data: result })
})

authRoute.post('/login', sValidator('json', loginSchema), async (c) => {
  const { identifier, password } = c.req.valid('json')

  const result = await loginUser(identifier, password)

  c.res.headers.set(
    'Set-Cookie',
    `refreshToken=${result.refreshToken}; HttpOnly; SameSite=Lax; Path=api/auth/refresh-access-token; Max-Age=${60 * 60 * 24 * 30}`
  )

  return c.json({
    success: true,
    data: { accessToken: result.accessToken, user: result.user },
  })
})

authRoute.post('/refresh-access-token', async (c) => {
  const refreshToken = getCookie(c, 'refreshToken')

  if (!refreshToken)
    return c.json(
      { success: false, code: 'NO_REFRESH_TOKEN_PROVIDED', error: 'No refresh token provided' },
      401
    )

  const result = await refreshAccessToken(refreshToken)

  c.res.headers.set(
    'Set-Cookie',
    `refreshToken=${result.refreshToken}; HttpOnly; SameSite=Lax; Path=api/auth/refresh-access-token; Max-Age=${60 * 60 * 24 * 30}`
  )

  return c.json({ success: true, data: { accessToken: result.accessToken } })
})
