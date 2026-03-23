import prisma from '../config/prisma'

type User = Awaited<ReturnType<typeof prisma.user.findUniqueOrThrow>>

export const userRepository = {
  findById: (id: string): Promise<User | null> => {
    return prisma.user.findUnique({ where: { id } })
  },

  findByEmail: (email: string): Promise<User | null> => {
    return prisma.user.findUnique({ where: { email } })
  },

  create: (data: { username: string; email: string; passwordHash: string }): Promise<User> => {
    return prisma.user.create({ data })
  },
}
