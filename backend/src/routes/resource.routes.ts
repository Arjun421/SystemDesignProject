import { Router } from 'express'
import { resourceController } from '../controllers/resource.controller'
import { optionalAuth } from '../middleware/optional-auth.middleware'
import { validateRequest } from '../middleware/validate.middleware'
import { getResourceByIdParamsSchema, listResourcesQuerySchema } from '../validation/resource.schemas'

const router = Router()

router.get('/', optionalAuth, validateRequest({ query: listResourcesQuerySchema }), resourceController.getAll)
router.get('/:id', optionalAuth, validateRequest({ params: getResourceByIdParamsSchema }), resourceController.getById)

export default router
