import { Router } from 'express'
import { courseController } from '../controllers/course.controller'
import { authenticate } from '../middleware/auth.middleware'
import { validateRequest } from '../middleware/validate.middleware'
import {
  courseIdParamsSchema,
  courseModuleParamsSchema,
  updateModuleProgressBodySchema,
  updateProgressBodySchema,
} from '../validation/course.schemas'

const router = Router()

router.get('/my-enrollments', authenticate, courseController.myEnrollments)
router.post('/:id/enroll', authenticate, validateRequest({ params: courseIdParamsSchema }), courseController.enroll)
router.patch(
  '/:id/progress',
  authenticate,
  validateRequest({ params: courseIdParamsSchema, body: updateProgressBodySchema }),
  courseController.updateProgress
)
router.patch(
  '/:id/modules/:moduleId',
  authenticate,
  validateRequest({ params: courseModuleParamsSchema, body: updateModuleProgressBodySchema }),
  courseController.updateModuleProgress
)

export default router
