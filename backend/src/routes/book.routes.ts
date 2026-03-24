import { Router } from 'express'
import { bookController } from '../controllers/book.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

router.get('/history', authenticate, bookController.history)
router.get('/active', authenticate, bookController.activeBorrows)
router.post('/:id/borrow', authenticate, bookController.borrow)
router.post('/:id/return', authenticate, bookController.return)

export default router
