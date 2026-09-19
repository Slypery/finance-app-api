import z from 'zod'

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(15)
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: 'Username may only contain letters, numbers, and underscores',
    }),
  email: z.string(),
  displayName: z.string().min(3).max(20),
  password: z.string().min(8),
})

export const loginSchema = z.object({
  identifier: z.string(),
  password: z.string(),
})
