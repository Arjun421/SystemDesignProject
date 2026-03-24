import { Response } from 'express'
import { Request } from 'express'
import { resourceProxy } from '../patterns/resource-access.proxy'
import { AuthRequest } from '../middleware/auth.middleware'

export const resourceController = {
  getAll: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { search, type, page, limit } = req.query
      const result = await resourceProxy.getAll(
        {
          search: search as string,
          type: type as 'BOOK' | 'COURSE',
          page: page ? parseInt(page as string) : 1,
          limit: limit ? parseInt(limit as string) : 10,
        },
        req.user?.userId
      )
      res.json({ success: true, ...result })
    } catch (err: any) {
      res.status(err.status || 500).json({ success: false, error: err.message || 'Internal server error' })
    }
  },

  getById: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const resource = await resourceProxy.getById(req.params.id as string, req.user?.userId)
      res.json({ success: true, data: resource })
    } catch (err: any) {
      res.status(err.status || 500).json({ success: false, error: err.message || 'Internal server error' })
    }
  },
}
