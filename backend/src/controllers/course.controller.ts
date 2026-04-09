import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import { courseService } from '../services/course.service'
import { asyncHandler } from '../utils/async-handler'

export const courseController = {
  myEnrollments: asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await courseService.myEnrollments(req.jwtUser!.userId)
    res.json({ success: true, data })
  }),

  enroll: asyncHandler(async (req: AuthRequest, res: Response) => {
    const enrollment = await courseService.enrollUser(req.jwtUser!.userId, req.params.id as string)
    res.status(201).json({ success: true, data: enrollment })
  }),

  updateProgress: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { progress } = req.body as { progress: number }
    const enrollment = await courseService.updateProgress(req.jwtUser!.userId, req.params.id as string, progress)
    res.json({ success: true, data: enrollment })
  }),

  updateModuleProgress: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { completed } = req.body as { completed: boolean }
    const enrollment = await courseService.updateModuleProgress(
      req.jwtUser!.userId,
      req.params.id as string,
      req.params.moduleId as string,
      completed
    )
    res.json({ success: true, data: enrollment })
  }),
}
