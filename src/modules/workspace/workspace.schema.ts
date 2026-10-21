import { nulledEmptyString } from '@/shared/zod-helpers.js'
import z from 'zod'

export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(5).max(50),
  description: nulledEmptyString,
})

export const patchWorkspaceSchema = z.object({
  name: z.string().trim().min(5).max(50).optional(),
  description: nulledEmptyString.optional(),
})
