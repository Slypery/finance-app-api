import { db, type Transaction } from '@/db/index.js'

import { refreshTokens, type Users } from '@/db/schema.js'
import { env } from '@/env.js'
import { AppError } from '@/errors/app.error.js'
import { signAccessToken } from '@/lib/jwt.js'
import { createHash, randomBytes } from 'crypto'
import { eq } from 'drizzle-orm'

export async function createRefreshToken(userId: Users['id'], tx?: Transaction): Promise<string> {
  const client = tx ?? db

  // create refresh token
  const refreshToken = randomBytes(64).toString('hex')
  const refreshTokenHash = createHash('sha256').update(refreshToken).digest('hex')
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL)

  // store refresh token hash in database
  await client.insert(refreshTokens).values({
    userId: userId,
    refreshTokenHash,
    expiresAt,
  })

  return refreshToken
}

type RefreshAccessTokenResult = {
  refreshToken: string
  accessToken: string
}

export class InvalidTokenError extends AppError {
  constructor() {
    super('Invalid Token', 401, 'INVALID_TOKEN')
  }
}

export class TokenRevokedError extends AppError {
  constructor() {
    super('Token Revoked', 401, 'TOKEN_REVOKED')
  }
}

export class TokenExpiredError extends AppError {
  constructor() {
    super('Token Expired', 401, 'TOKEN_EXPIRED')
  }
}

export class TokenReuseDetectedError extends AppError {
  constructor() {
    super('Token Reuse Detected', 401, 'TOKEN_REUSE_DETECTED')
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<RefreshAccessTokenResult> {
  const refreshTokenHash = createHash('sha256').update(refreshToken).digest('hex')

  // find the refresh token
  const storedToken = await db.query.refreshTokens.findFirst({
    where: { refreshTokenHash },
  })

  if (!storedToken) throw new InvalidTokenError() // if not found

  if (storedToken.revokedAt) throw new TokenRevokedError() // if revoked

  if (storedToken.expiresAt < new Date()) {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.id, storedToken.id))

    throw new TokenExpiredError() // if expired
  }

  // token already used
  // TODO: evaluate how access token reuse is being detected (maybe add grace period)
  if (storedToken.usedAt) {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.userId, storedToken.userId))

    throw new TokenReuseDetectedError()
  }

  const newAccessToken = await signAccessToken(storedToken.userId)

  const newRefreshToken = await db.transaction(async (tx) => {
    const newRefreshToken = await createRefreshToken(storedToken.userId, tx)

    await tx
      .update(refreshTokens)
      .set({ usedAt: new Date() })
      .where(eq(refreshTokens.id, storedToken.id))

    return newRefreshToken
  })

  return { refreshToken: newRefreshToken, accessToken: newAccessToken }
}
