import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AuthRequest } from './auth.middleware'

// Like authenticate but doesn't reject — just attaches user if token exists
export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string }
      req.user = decoded
    } catch {
      // Invalid token — continue as guest
    }
  }
  next()
}
