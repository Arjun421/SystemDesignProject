import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { authService } from '../services/auth.service'
import { userRepository } from '../repositories/user.repository'

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL

export const googleOAuthConfigured = Boolean(
  googleClientId && googleClientSecret && googleCallbackUrl
)

if (googleOAuthConfigured) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId!,
        clientSecret: googleClientSecret!,
        callbackURL: googleCallbackUrl!,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value
          if (!email) {
            return done(new Error('No email returned from Google'))
          }

          let user = await userRepository.findByEmail(email)

          if (!user) {
            const baseUsername = profile.displayName || email.split('@')[0]
            const username = await authService.ensureUniqueUsername(baseUsername)

            user = await userRepository.create({
              username,
              email,
              passwordHash: '',
            })
          }

          return done(null, user)
        } catch (error) {
          return done(error as Error)
        }
      }
    )
  )
} else {
  console.warn(
    '[auth] Google OAuth is disabled because GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or GOOGLE_CALLBACK_URL is missing.'
  )
}

export default passport
