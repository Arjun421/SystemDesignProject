import { Prisma, UserLearningPathStatus } from '@prisma/client'
import prisma from '../config/prisma'
import { conflict, notFound } from '../errors/app-error'

const learningPathInclude = {
  items: {
    orderBy: { position: 'asc' as const },
    include: {
      resource: {
        include: {
          book: true,
          course: true,
        },
      },
    },
  },
}

const parseCompletedItemIds = (value: Prisma.JsonValue): string[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is string => typeof item === 'string')
}

const buildUserPathUpdate = (completedItemIds: string[], totalItems: number) => {
  const uniqueCompleted = [...new Set(completedItemIds)]
  const progressPercent = totalItems === 0
    ? 0
    : Math.round((uniqueCompleted.length / totalItems) * 100)
  const isCompleted = totalItems > 0 && uniqueCompleted.length === totalItems

  return {
    completedItemIds: uniqueCompleted,
    progressPercent,
    status: isCompleted ? UserLearningPathStatus.COMPLETED : UserLearningPathStatus.ACTIVE,
    completedAt: isCompleted ? new Date() : null,
  }
}

export const learningPathRepository = {
  findAll: (params: {
    search?: string
    difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
    page: number
    limit: number
  }) => {
    const skip = (params.page - 1) * params.limit

    const where = {
      ...(params.difficulty && { difficulty: params.difficulty }),
      ...(params.search && {
        OR: [
          { title: { contains: params.search, mode: 'insensitive' as const } },
          { description: { contains: params.search, mode: 'insensitive' as const } },
        ],
      }),
    }

    return Promise.all([
      prisma.learningPath.findMany({
        where,
        skip,
        take: params.limit,
        include: learningPathInclude,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.learningPath.count({ where }),
    ])
  },

  findById: (id: string) => {
    return prisma.learningPath.findUnique({
      where: { id },
      include: learningPathInclude,
    })
  },

  findBySlug: (slug: string) => {
    return prisma.learningPath.findUnique({
      where: { slug },
      include: learningPathInclude,
    })
  },

  startPath: async (userId: string, learningPathId: string) => {
    const existing = await prisma.userLearningPath.findUnique({
      where: {
        userId_learningPathId: {
          userId,
          learningPathId,
        },
      },
    })

    if (existing) {
      throw conflict('Learning path already started')
    }

    return prisma.userLearningPath.create({
      data: {
        userId,
        learningPathId,
      },
      include: {
        learningPath: {
          include: learningPathInclude,
        },
      },
    })
  },

  myPaths: (userId: string, status?: UserLearningPathStatus) => {
    return prisma.userLearningPath.findMany({
      where: {
        userId,
        ...(status && { status }),
      },
      include: {
        learningPath: {
          include: learningPathInclude,
        },
      },
      orderBy: { startedAt: 'desc' },
    })
  },

  updateItemCompletion: async (
    userId: string,
    learningPathId: string,
    itemId: string,
    completed: boolean
  ) => {
    return prisma.$transaction(async (tx) => {
      const userPath = await tx.userLearningPath.findUnique({
        where: {
          userId_learningPathId: {
            userId,
            learningPathId,
          },
        },
      })

      if (!userPath) {
        throw notFound('Learning path not started')
      }

      const item = await tx.learningPathItem.findFirst({
        where: {
          id: itemId,
          learningPathId,
        },
      })

      if (!item) {
        throw notFound('Learning path item not found')
      }

      const pathItems = await tx.learningPathItem.findMany({
        where: { learningPathId },
        select: { id: true },
      })

      const completedItemIds = parseCompletedItemIds(userPath.completedItemIds)
      const nextCompletedItemIds = completed
        ? [...completedItemIds, itemId]
        : completedItemIds.filter((completedItemId) => completedItemId !== itemId)

      const updated = await tx.userLearningPath.update({
        where: { id: userPath.id },
        data: buildUserPathUpdate(nextCompletedItemIds, pathItems.length),
        include: {
          learningPath: {
            include: learningPathInclude,
          },
        },
      })

      return updated
    })
  },

  getUserStartedPathIds: async (userId: string) => {
    const userPaths = await prisma.userLearningPath.findMany({
      where: { userId },
      select: { learningPathId: true },
    })

    return userPaths.map((userPath) => userPath.learningPathId)
  },

  findRecommendationCandidates: (excludeIds: string[], limit = 25) => {
    return prisma.learningPath.findMany({
      where: {
        id: { notIn: excludeIds },
      },
      include: learningPathInclude,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  },
}
