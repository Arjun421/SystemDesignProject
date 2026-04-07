import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

// Use a custom property to avoid conflict with passport's Express.User type
export interface AuthRequest extends Request {
  user?: any // passport sets this; we cast to our shape where needed
  jwtUser?: { userId: string; role: string }
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' })
    return
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string }
    req.jwtUser = decoded
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
