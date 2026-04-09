import { Router } from 'express'
import { learningPathController } from '../controllers/learning-path.controller'
import { authenticate } from '../middleware/auth.middleware'
import { optionalAuth } from '../middleware/optional-auth.middleware'
import { validateRequest } from '../middleware/validate.middleware'
import {
  learningPathIdParamsSchema,
  learningPathItemParamsSchema,
  learningPathSlugParamsSchema,
  listLearningPathsQuerySchema,
  myLearningPathsQuerySchema,
  updateLearningPathItemBodySchema,
} from '../validation/learning-path.schemas'

const router = Router()

router.get('/', optionalAuth, validateRequest({ query: listLearningPathsQuerySchema }), learningPathController.listAll)
router.get('/slug/:slug', optionalAuth, validateRequest({ params: learningPathSlugParamsSchema }), learningPathController.getBySlug)
router.get('/my-paths', authenticate, validateRequest({ query: myLearningPathsQuerySchema }), learningPathController.myPaths)
router.get('/:id', optionalAuth, validateRequest({ params: learningPathIdParamsSchema }), learningPathController.getById)
router.post('/:id/start', authenticate, validateRequest({ params: learningPathIdParamsSchema }), learningPathController.startPath)
router.patch(
  '/:id/items/:itemId',
  authenticate,
  validateRequest({ params: learningPathItemParamsSchema, body: updateLearningPathItemBodySchema }),
  learningPathController.updateItemCompletion
)

export default router
