import { Router } from 'express'
import { courseController } from '../controllers/course.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

router.get('/my-enrollments', authenticate, courseController.myEnrollments)
router.post('/:id/enroll', authenticate, courseController.enroll)
router.patch('/:id/progress', authenticate, courseController.updateProgress)

export default router
