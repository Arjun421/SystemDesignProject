import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import { courseService } from '../services/course.service'

export const courseController = {
  myEnrollments: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const data = await courseService.myEnrollments(req.jwtUser!.userId)
      res.json({ success: true, data })
    } catch (err: any) {
      res.status(err.status || 500).json({ success: false, error: err.message || 'Internal server error' })
    }
  },

  enroll: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const enrollment = await courseService.enrollUser(req.jwtUser!.userId, req.params.id as string)
      res.status(201).json({ success: true, data: enrollment })
    } catch (err: any) {
      res.status(err.status || 500).json({ success: false, error: err.message || 'Internal server error' })
    }
  },

  updateProgress: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { progress } = req.body
      if (progress === undefined) {
        res.status(400).json({ success: false, error: 'progress is required' })
        return
      }
      const enrollment = await courseService.updateProgress(req.jwtUser!.userId, req.params.id as string, progress)
      res.json({ success: true, data: enrollment })
    } catch (err: any) {
      res.status(err.status || 500).json({ success: false, error: err.message || 'Internal server error' })
    }
  },
}
