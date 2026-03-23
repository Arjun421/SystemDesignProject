import prisma from '../config/prisma'

export const resourceRepository = {
  findAll: (params: {
    search?: string
    type?: 'BOOK' | 'COURSE'
    page: number
    limit: number
  }) => {
    const { search, type, page, limit } = params
    const skip = (page - 1) * limit

    const where = {
      ...(type && { type }),
      ...(search && {
        title: { contains: search, mode: 'insensitive' as const },
      }),
    }

    return Promise.all([
      prisma.resource.findMany({
        where,
        skip,
        take: limit,
        include: { book: true, course: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.resource.count({ where }),
    ])
  },

  findById: (id: string) => {
    return prisma.resource.findUnique({
      where: { id },
      include: { book: true, course: true },
    })
  },
}
