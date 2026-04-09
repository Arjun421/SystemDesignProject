import { Response } from 'express'
import { UserLearningPathStatus } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.middleware'
import { ValidatedRequest } from '../middleware/validate.middleware'
import { learningPathService } from '../services/learning-path.service'
import { asyncHandler } from '../utils/async-handler'

export const learningPathController = {
  listAll: asyncHandler(async (req: AuthRequest & ValidatedRequest, res: Response) => {
    const { search, difficulty, page, limit } = req.validatedQuery as {
      search?: string
      difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
      page: number
      limit: number
    }

    const result = await learningPathService.listAll(
      { search, difficulty, page, limit },
      req.jwtUser?.userId
    )

    res.json({ success: true, ...result })
  }),

  getById: asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await learningPathService.getById(req.params.id as string, req.jwtUser?.userId)
    res.json({ success: true, data })
  }),

  getBySlug: asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await learningPathService.getBySlug(req.params.slug as string, req.jwtUser?.userId)
    res.json({ success: true, data })
  }),

  startPath: asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await learningPathService.startPath(req.jwtUser!.userId, req.params.id as string)
    res.status(201).json({ success: true, data })
  }),

  myPaths: asyncHandler(async (req: AuthRequest & ValidatedRequest, res: Response) => {
    const { status } = req.validatedQuery as { status?: UserLearningPathStatus }
    const data = await learningPathService.myPaths(req.jwtUser!.userId, status)
    res.json({ success: true, data })
  }),

  updateItemCompletion: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { completed } = req.body as { completed: boolean }
    const data = await learningPathService.updateItemCompletion(
      req.jwtUser!.userId,
      req.params.id as string,
      req.params.itemId as string,
      completed
    )
    res.json({ success: true, data })
  }),
}
