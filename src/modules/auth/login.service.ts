import { db } from '@/db/index.js'
import type { Users } from '@/db/schema.js'
import { AppError } from '@/errors/app.error.js'
import { signAccessToken } from '@/lib/jwt.js'
import { createRefreshToken } from '@/modules/auth/refreshToken.service.js'
import { argon2Verify } from 'hash-wasm'

export async function loginUser(identifier: Users['email'] | Users['username'], password: string) {
  // find user based on email or username
  const userData = await db.query.users.findFirst({
    where: { OR: [{ email: identifier }, { username: identifier }] },
  })

  if (!userData) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS')

  // verify password
  const credentials_ok = await argon2Verify({ password: password, hash: userData.passwordHash })
  if (!credentials_ok) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS')

  // create access token
  const accessToken = await signAccessToken(userData.id)

  // create refresh token
  const refreshToken = await createRefreshToken(userData.id)

  return {
    refreshToken,
    accessToken,
    user: {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      displayName: userData.displayName,
    },
  }
}
