import { Request, Response } from 'express'
import { authService } from '../services/auth.service'
import { asyncHandler } from '../utils/async-handler'

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const { username, email, password } = req.body as {
      username: string
      email: string
      password: string
    }

    const result = await authService.register({ username, email, password })
    res.status(201).json(result)
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body as {
      email: string
      password: string
    }

    const result = await authService.login({ email, password })
    res.status(200).json(result)
  }),
}
