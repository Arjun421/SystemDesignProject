import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import { bookService } from '../services/book.service'

export const bookController = {
  borrow: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const record = await bookService.borrowBook(req.jwtUser!.userId, req.params.id as string)
      res.status(201).json({ success: true, data: record })
    } catch (err: any) {
      res.status(err.status || 500).json({ success: false, error: err.message || 'Internal server error' })
    }
  },

  return: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const record = await bookService.returnBook(req.jwtUser!.userId, req.params.id as string)
      res.json({ success: true, data: record })
    } catch (err: any) {
      res.status(err.status || 500).json({ success: false, error: err.message || 'Internal server error' })
    }
  },

  history: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const records = await bookService.getBorrowHistory(req.jwtUser!.userId)
      res.json({ success: true, data: records })
    } catch (err: any) {
      res.status(err.status || 500).json({ success: false, error: err.message || 'Internal server error' })
    }
  },

  activeBorrows: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const records = await bookService.getActiveBorrows(req.jwtUser!.userId)
      res.json({ success: true, data: records })
    } catch (err: any) {
      res.status(err.status || 500).json({ success: false, error: err.message || 'Internal server error' })
    }
  },
}
