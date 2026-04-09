import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { unauthorized } from '../errors/app-error'

export interface JwtUserPayload {
  userId: string
  role: string
}

export interface AuthRequest extends Request {
  user?: any
  jwtUser?: JwtUserPayload
}

export const authenticate = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(unauthorized('No token provided'))
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    req.jwtUser = jwt.verify(token, process.env.JWT_SECRET!) as JwtUserPayload
    next()
  } catch {
    next(unauthorized('Invalid or expired token'))
  }
}
