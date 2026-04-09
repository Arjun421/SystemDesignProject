import { z } from 'zod'
import { emptyStringToUndefined, idParamSchema, paginationQuerySchema } from './common.schemas'

export const learningPathIdParamsSchema = idParamSchema

export const learningPathSlugParamsSchema = z.object({
  slug: z.string().trim().min(1).max(160),
})

export const listLearningPathsQuerySchema = paginationQuerySchema.extend({
  search: emptyStringToUndefined(z.string().trim().min(1).max(120)),
  difficulty: emptyStringToUndefined(z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])),
})

export const myLearningPathsQuerySchema = z.object({
  status: emptyStringToUndefined(z.enum(['ACTIVE', 'COMPLETED', 'ABANDONED'])),
})

export const learningPathItemParamsSchema = z.object({
  id: z.string().uuid(),
  itemId: z.string().uuid(),
})

export const updateLearningPathItemBodySchema = z.object({
  completed: z.boolean(),
})
