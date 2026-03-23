import { Router } from 'express'
import { resourceController } from '../controllers/resource.controller'

const router = Router()

router.get('/', resourceController.getAll)
router.get('/:id', resourceController.getById)

export default router
