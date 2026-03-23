import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import { bookService } from '../services/book.service'

export const bookController = {
  borrow: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const record = await bookService.borrowBook(req.user!.userId, req.params.id as string)
      res.status(201).json(record)
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
    }
  },

  return: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const record = await bookService.returnBook(req.user!.userId, req.params.id as string)
      res.json(record)
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
    }
  },
}
