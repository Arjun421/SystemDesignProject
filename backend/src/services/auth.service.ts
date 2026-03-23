import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { userRepository } from '../repositories/user.repository'

const SALT_ROUNDS = 10
const JWT_SECRET = process.env.JWT_SECRET!
const JWT_EXPIRES_IN = '7d'

export interface AuthResult {
  token: string
  user: {
    id: string
    username: string
    email: string
    role: string
  }
}

export const authService = {
  register: async (data: { username: string; email: string; password: string }): Promise<AuthResult> => {
    const existing = await userRepository.findByEmail(data.email)
    if (existing) throw { status: 409, message: 'Email already registered' }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS)
    const user = await userRepository.create({ username: data.username, email: data.email, passwordHash })

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
    return { token, user: { id: user.id, username: user.username, email: user.email, role: user.role } }
  },

  login: async (data: { email: string; password: string }): Promise<AuthResult> => {
    const user = await userRepository.findByEmail(data.email)
    if (!user) throw { status: 401, message: 'Invalid credentials' }

    const valid = await bcrypt.compare(data.password, user.passwordHash)
    if (!valid) throw { status: 401, message: 'Invalid credentials' }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
    return { token, user: { id: user.id, username: user.username, email: user.email, role: user.role } }
  },
}
