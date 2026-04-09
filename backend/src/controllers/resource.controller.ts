import { Response } from 'express'
import { resourceProxy } from '../patterns/resource-access.proxy'
import { AuthRequest } from '../middleware/auth.middleware'
import { ValidatedRequest } from '../middleware/validate.middleware'
import { asyncHandler } from '../utils/async-handler'

export const resourceController = {
  getAll: asyncHandler(async (req: AuthRequest & ValidatedRequest, res: Response) => {
    const { search, type, category, page, limit } = req.validatedQuery as {
      search?: string
      type?: 'BOOK' | 'COURSE'
      category?: string
      page: number
      limit: number
    }

    const result = await resourceProxy.getAll(
      { search, type, category, page, limit },
      req.jwtUser?.userId
    )

    res.json({ success: true, ...result })
  }),

  getById: asyncHandler(async (req: AuthRequest, res: Response) => {
    const resource = await resourceProxy.getById(req.params.id as string, req.jwtUser?.userId)
    res.json({ success: true, data: resource })
  }),
}
