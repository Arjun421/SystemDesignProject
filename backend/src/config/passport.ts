import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { userRepository } from '../repositories/user.repository'

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL!,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value
        if (!email) return done(new Error('No email returned from Google'))

        // Find existing user or create new one
        let user = await userRepository.findByEmail(email)

        if (!user) {
          // Generate unique username from Google display name
          const base = (profile.displayName || email.split('@')[0])
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '')

          user = await userRepository.create({
            username:     base || `user_${Date.now()}`,
            email,
            passwordHash: '', // OAuth users have no password
          })
        }

        return done(null, user)
      } catch (err) {
        return done(err as Error)
      }
    }
  )
)

export default passport
