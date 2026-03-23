import { Request, Response } from 'express'
import { resourceService } from '../services/resource.service'

export const resourceController = {
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const { search, type, page, limit } = req.query
      const result = await resourceService.getAll({
        search: search as string,
        type: type as 'BOOK' | 'COURSE',
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
      })
      res.json(result)
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
    }
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    try {
      const resource = await resourceService.getById(req.params.id as string)
      res.json(resource)
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
    }
  },
}
