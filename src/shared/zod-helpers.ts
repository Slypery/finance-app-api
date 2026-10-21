import z from 'zod'

export const nulledEmptyString = z
  .string()
  .trim()
  .nullable()
  .transform((v) => (v === '' ? null : v))
