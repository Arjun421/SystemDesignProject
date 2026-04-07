import { Router } from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import { authController } from '../controllers/auth.controller'

const router = Router()

// Email/password auth
router.post('/register', authController.register)
router.post('/login',    authController.login)

// ── Google OAuth ──

// Step 1: redirect user to Google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
)

// Step 2: Google redirects back here with code
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed` }),
  (req: any, res: any) => {
    const user = req.user as any

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    const userPayload = encodeURIComponent(JSON.stringify({
      id:       user.id,
      username: user.username,
      email:    user.email,
      role:     user.role,
    }))

    // Redirect to frontend callback page with token + user
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&user=${userPayload}`)
  }
)

export default router
