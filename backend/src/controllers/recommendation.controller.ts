import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import { recommendationService } from '../services/recommendation.service'
import { asyncHandler } from '../utils/async-handler'

export const recommendationController = {
  getRecommendations: asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await recommendationService.getRecommendations(req.jwtUser!.userId)
    res.json({ success: true, data })
  }),
}
