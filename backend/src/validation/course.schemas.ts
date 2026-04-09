import { z } from 'zod'
import { idParamSchema } from './common.schemas'

export const courseIdParamsSchema = idParamSchema

export const courseModuleParamsSchema = z.object({
  id: z.string().uuid(),
  moduleId: z.string().min(1).max(120),
})

export const updateProgressBodySchema = z.object({
  progress: z.coerce.number().int().min(0).max(100),
})

export const updateModuleProgressBodySchema = z.object({
  completed: z.boolean(),
})
