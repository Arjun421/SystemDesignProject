import { z } from 'zod'
import { emptyStringToUndefined, idParamSchema, paginationQuerySchema } from './common.schemas'

export const getResourceByIdParamsSchema = idParamSchema

export const listResourcesQuerySchema = paginationQuerySchema.extend({
  search: emptyStringToUndefined(z.string().trim().min(1).max(120)),
  type: emptyStringToUndefined(z.enum(['BOOK', 'COURSE'])),
  category: emptyStringToUndefined(z.string().trim().min(1).max(80)),
})
