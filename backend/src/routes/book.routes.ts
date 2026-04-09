import { Router } from 'express'
import { bookController } from '../controllers/book.controller'
import { authenticate } from '../middleware/auth.middleware'
import { validateRequest } from '../middleware/validate.middleware'
import { bookIdParamsSchema } from '../validation/book.schemas'

const router = Router()

router.get('/history', authenticate, bookController.history)
router.get('/active', authenticate, bookController.activeBorrows)
router.post('/:id/borrow', authenticate, validateRequest({ params: bookIdParamsSchema }), bookController.borrow)
router.post('/:id/return', authenticate, validateRequest({ params: bookIdParamsSchema }), bookController.return)

export default router
