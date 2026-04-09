import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Role } from '@prisma/client'
import { conflict, unauthorized } from '../errors/app-error'
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

const normalizeUsername = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 40)

const buildAuthResult = (user: { id: string; username: string; email: string; role: Role }): AuthResult => {
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  }
}

export const authService = {
  createTokenForUser: (user: { id: string; username: string; email: string; role: Role }) => buildAuthResult(user),

  ensureUniqueUsername: async (username: string) => {
    const normalized = normalizeUsername(username) || 'user'
    let candidate = normalized
    let suffix = 1

    while (await userRepository.findByUsername(candidate)) {
      candidate = `${normalized}_${suffix}`
      suffix += 1
    }

    return candidate
  },

  register: async (data: { username: string; email: string; password: string }): Promise<AuthResult> => {
    const [existingEmail, existingUsername] = await Promise.all([
      userRepository.findByEmail(data.email),
      userRepository.findByUsername(data.username),
    ])

    if (existingEmail) {
      throw conflict('Email already registered')
    }

    if (existingUsername) {
      throw conflict('Username already taken')
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS)
    const user = await userRepository.create({
      username: data.username,
      email: data.email,
      passwordHash,
    })

    return buildAuthResult(user)
  },

  login: async (data: { email: string; password: string }): Promise<AuthResult> => {
    const user = await userRepository.findByEmail(data.email)
    if (!user || !user.passwordHash) {
      throw unauthorized('Invalid credentials')
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash)
    if (!valid) {
      throw unauthorized('Invalid credentials')
    }

    return buildAuthResult(user)
  },
}
