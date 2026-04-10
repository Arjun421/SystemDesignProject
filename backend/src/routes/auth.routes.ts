import { NextFunction, Request, Response, Router } from 'express'
import passport from 'passport'
import { authController } from '../controllers/auth.controller'
import { authService } from '../services/auth.service'
import { googleOAuthConfigured } from '../config/passport'
import { validateRequest } from '../middleware/validate.middleware'
import { loginSchema, registerSchema } from '../validation/auth.schemas'

const router = Router()

const ensureGoogleOAuthConfigured = (_req: Request, res: Response, next: NextFunction) => {
  if (!googleOAuthConfigured) {
    res.status(503).json({
      success: false,
      error: 'Google OAuth is not configured on this server',
      code: 'GOOGLE_OAUTH_NOT_CONFIGURED',
    })
    return
  }

  next()
}

router.post('/register', validateRequest({ body: registerSchema }), authController.register)
router.post('/login', validateRequest({ body: loginSchema }), authController.login)

router.get(
  '/google',
  ensureGoogleOAuthConfigured,
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
)

router.get(
  '/google/callback',
  ensureGoogleOAuthConfigured,
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('google', {
      session: false,
    }, (err: any, user: any) => {
      if (err) {
        console.error('[Google OAuth Error]', err)
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`)
      }
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`)
      }
      try {
        const result = authService.createTokenForUser(user)
        const userPayload = encodeURIComponent(JSON.stringify(result.user))
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${result.token}&user=${userPayload}`)
      } catch (e) {
        console.error('[Google OAuth Token Error]', e)
        res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`)
      }
    })(req, res, next)
  }
)

export default router
