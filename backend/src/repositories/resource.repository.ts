import prisma from '../config/prisma'

export const resourceRepository = {
  findAll: (params: {
    search?: string
    type?: 'BOOK' | 'COURSE'
    category?: string
    page: number
    limit: number
  }) => {
    const { search, type, category, page, limit } = params
    const skip = (page - 1) * limit

    const where = {
      ...(type && { type }),
      ...(category && { category: { contains: category, mode: 'insensitive' as const } }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
          { category: { contains: search, mode: 'insensitive' as const } },
        ],
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

  findByIds: (ids: string[]) => {
    return prisma.resource.findMany({
      where: { id: { in: ids } },
      include: { book: true, course: true },
    })
  },

  findRecommendationCandidates: (params: {
    excludeIds: string[]
    limit?: number
  }) => {
    return prisma.resource.findMany({
      where: {
        id: { notIn: params.excludeIds },
      },
      include: { book: true, course: true },
      orderBy: { createdAt: 'desc' },
      take: params.limit ?? 50,
    })
  },
}
