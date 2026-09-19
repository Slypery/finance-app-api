import 'dotenv/config'
import { z } from 'zod'

const SECONDS_PER_UNIT = { s: 1, m: 60, h: 3600, d: 86400, w: 604800 } as const

const duration = (fallback: string) =>
  z
    .string()
    .regex(/^\d+[smhdw]$/, "Must look like '15m', '12h' or '30d'")
    .default(fallback)
    .transform((value) => {
      const amount = Number(value.slice(0, -1))
      const unit = value.slice(-1) as keyof typeof SECONDS_PER_UNIT
      return amount * SECONDS_PER_UNIT[unit]
    })

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  PORT: z.coerce.number().int().positive().default(3000),
  ACCESS_TOKEN_TTL: duration('15m'),
  REFRESH_TOKEN_TTL: duration('30d'),
})

export const env = envSchema.parse(process.env)
