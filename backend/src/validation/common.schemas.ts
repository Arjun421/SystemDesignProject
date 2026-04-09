import { z } from 'zod'

export const emptyStringToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    schema.optional()
  )

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
})

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid UUID format'),
})

// Search query schema for filtering resources
export const searchQuerySchema = z.object({
  q: z.string().optional(),
  type: z.enum(['book', 'course']).optional(),
  isPremium: z.coerce.boolean().optional(),
})
