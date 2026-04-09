import { NextFunction, Response } from 'express'
import jwt from 'jsonwebtoken'
import { AuthRequest, JwtUserPayload } from './auth.middleware'

export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1]
      req.jwtUser = jwt.verify(token, process.env.JWT_SECRET!) as JwtUserPayload
    } catch {
      req.jwtUser = undefined
    }
  }

  next()
}
