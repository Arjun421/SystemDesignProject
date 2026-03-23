import { Request, Response } from 'express'
import { authService } from '../services/auth.service'

export const authController = {
  register: async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, email, password } = req.body
      if (!username || !email || !password) {
        res.status(400).json({ error: 'username, email and password are required' })
        return
      }
      if (password.length < 8) {
        res.status(400).json({ error: 'Password must be at least 8 characters' })
        return
      }
      const result = await authService.register({ username, email, password })
      res.status(201).json(result)
    } catch (err: any) {
      console.error('Register error:', err)
      res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
    }
  },

  login: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body
      if (!email || !password) {
        res.status(400).json({ error: 'email and password are required' })
        return
      }
      const result = await authService.login({ email, password })
      res.status(200).json(result)
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
    }
  },
}
