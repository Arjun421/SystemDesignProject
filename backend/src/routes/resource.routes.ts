import { Router } from 'express'
import { resourceController } from '../controllers/resource.controller'
import { optionalAuth } from '../middleware/optional-auth.middleware'

const router = Router()

router.get('/', optionalAuth, resourceController.getAll)
router.get('/:id', optionalAuth, resourceController.getById)

export default router
