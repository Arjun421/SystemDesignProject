import { Router } from 'express'
import { recommendationController } from '../controllers/recommendation.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

router.get('/', authenticate, recommendationController.getRecommendations)

export default router
