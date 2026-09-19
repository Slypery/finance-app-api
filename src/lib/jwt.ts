import { SignJWT, jwtVerify } from 'jose'
import { env } from '@/env.js'

const secret = new TextEncoder().encode(env.JWT_SECRET)

export async function signAccessToken(userId: string) {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${env.ACCESS_TOKEN_TTL}s`)
    .sign(secret)
}

export type AccessTokenPayload = {
  userId: string
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, secret)
  return payload as AccessTokenPayload
}
