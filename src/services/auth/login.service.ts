import { db } from '@/db/index.js'
import type { Users } from '@/db/schema.js'
import { AppError } from '@/errors/app.error.js'
import { signAccessToken } from '@/lib/jwt.js'
import { createRefreshToken } from '@/services/auth/refreshToken.service.js'
import { argon2Verify } from 'hash-wasm'

type LoginUserResult = {
  refreshToken: string
  accessToken: string
  user: Pick<Users, 'id' | 'username' | 'email' | 'displayName'>
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super('Invalid credentials', 401, 'INVALID_CREDENTIALS')
  }
}

export async function loginUser(
  identifier: Users['email'] | Users['username'],
  password: string
): Promise<LoginUserResult> {
  // find user based on email or username
  const userData = await db.query.users.findFirst({
    where: { OR: [{ email: identifier }, { username: identifier }] },
  })

  if (!userData) throw new InvalidCredentialsError()

  // verify password
  const credentials_ok = await argon2Verify({ password: password, hash: userData.passwordHash })
  if (!credentials_ok) throw new InvalidCredentialsError()

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
