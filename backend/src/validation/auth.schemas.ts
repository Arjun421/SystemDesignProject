import { z } from 'zod'

const usernameSchema = z
  .string()
  .trim()
  .min(2)
  .max(40)
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can contain only letters, numbers, and underscores')

export const registerSchema = z.object({
  username: usernameSchema,
  email: z.string().trim().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
})

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email format'),
  password: z.string().min(1, 'Password is required').max(128),
})
