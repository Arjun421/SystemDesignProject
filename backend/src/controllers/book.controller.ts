import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import { bookService } from '../services/book.service'
import { asyncHandler } from '../utils/async-handler'

export const bookController = {
  borrow: asyncHandler(async (req: AuthRequest, res: Response) => {
    const record = await bookService.borrowBook(req.jwtUser!.userId, req.params.id as string)
    res.status(201).json({ success: true, data: record })
  }),

  return: asyncHandler(async (req: AuthRequest, res: Response) => {
    const record = await bookService.returnBook(req.jwtUser!.userId, req.params.id as string)
    res.json({ success: true, data: record })
  }),

  history: asyncHandler(async (req: AuthRequest, res: Response) => {
    const records = await bookService.getBorrowHistory(req.jwtUser!.userId)
    res.json({ success: true, data: records })
  }),

  activeBorrows: asyncHandler(async (req: AuthRequest, res: Response) => {
    const records = await bookService.getActiveBorrows(req.jwtUser!.userId)
    res.json({ success: true, data: records })
  }),
}
