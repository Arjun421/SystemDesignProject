import { Prisma, UserLearningPathStatus } from '@prisma/client'
import { forbidden, notFound, unauthorized } from '../errors/app-error'
import { learningPathRepository } from '../repositories/learning-path.repository'
import { userRepository } from '../repositories/user.repository'

const parseCompletedItemIds = (value: Prisma.JsonValue): string[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is string => typeof item === 'string')
}

const getUserRole = async (userId?: string) => {
  if (!userId) {
    return 'GUEST'
  }

  const user = await userRepository.findById(userId)
  return user?.role ?? 'FREE'
}

const ensurePremiumAccess = async (isPremium: boolean, userId?: string) => {
  if (!isPremium) {
    return
  }

  if (!userId) {
    throw unauthorized('Login required to access this learning path')
  }

  const role = await getUserRole(userId)
  if (role !== 'PREMIUM' && role !== 'ADMIN') {
    throw forbidden('Premium subscription required')
  }
}

const formatLearningPath = <
  T extends {
    items: Array<unknown>
    isPremium: boolean
    id: string
  }
>(
  learningPath: T,
  options?: {
    completedItemIds?: string[]
    role?: string
    started?: boolean
    status?: UserLearningPathStatus
  }
) => {
  const totalItems = learningPath.items.length
  const completedItems = options?.completedItemIds?.length ?? 0
  const progressPercent = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100)
  const role = options?.role ?? 'GUEST'

  return {
    ...learningPath,
    totalItems,
    completedItems,
    progressPercent,
    ...(learningPath.isPremium && role !== 'PREMIUM' && role !== 'ADMIN' && { _premiumLocked: true }),
    ...(options?.started !== undefined && { _started: options.started }),
    ...(options?.status && { _status: options.status }),
  }
}

export const learningPathService = {
  listAll: async (params: {
    search?: string
    difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
    page?: number
    limit?: number
  }, userId?: string) => {
    const page = params.page || 1
    const limit = params.limit || 10
    const role = await getUserRole(userId)
    const emptyUserPaths: Awaited<ReturnType<typeof learningPathRepository.myPaths>> = []

    const [paths, userPaths] = await Promise.all([
      learningPathRepository.findAll({
        search: params.search,
        difficulty: params.difficulty,
        page,
        limit,
      }),
      userId ? learningPathRepository.myPaths(userId) : Promise.resolve(emptyUserPaths),
    ])

    const [learningPaths, count] = paths
    const userPathMap = new Map(
      userPaths.map((userPath) => [userPath.learningPathId, userPath])
    )

    return {
      data: learningPaths.map((learningPath) => {
        const startedPath = userPathMap.get(learningPath.id)
        return formatLearningPath(learningPath, {
          role,
          started: Boolean(startedPath),
          status: startedPath?.status,
          completedItemIds: startedPath ? parseCompletedItemIds(startedPath.completedItemIds) : [],
        })
      }),
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    }
  },

  getById: async (id: string, userId?: string) => {
    const path = await learningPathRepository.findById(id)
    if (!path) {
      throw notFound('Learning path not found')
    }

    await ensurePremiumAccess(path.isPremium, userId)
    const role = await getUserRole(userId)
    return formatLearningPath(path, { role })
  },

  getBySlug: async (slug: string, userId?: string) => {
    const path = await learningPathRepository.findBySlug(slug)
    if (!path) {
      throw notFound('Learning path not found')
    }

    await ensurePremiumAccess(path.isPremium, userId)
    const role = await getUserRole(userId)
    return formatLearningPath(path, { role })
  },

  startPath: async (userId: string, learningPathId: string) => {
    const path = await learningPathRepository.findById(learningPathId)
    if (!path) {
      throw notFound('Learning path not found')
    }

    await ensurePremiumAccess(path.isPremium, userId)
    const userPath = await learningPathRepository.startPath(userId, learningPathId)

    return {
      ...userPath,
      learningPath: formatLearningPath(userPath.learningPath, {
        role: await getUserRole(userId),
        started: true,
        status: userPath.status,
        completedItemIds: parseCompletedItemIds(userPath.completedItemIds),
      }),
    }
  },

  myPaths: async (userId: string, status?: UserLearningPathStatus) => {
    const role = await getUserRole(userId)
    const userPaths = await learningPathRepository.myPaths(userId, status)

    return userPaths.map((userPath) => ({
      ...userPath,
      completedItemIds: parseCompletedItemIds(userPath.completedItemIds),
      learningPath: formatLearningPath(userPath.learningPath, {
        role,
        started: true,
        status: userPath.status,
        completedItemIds: parseCompletedItemIds(userPath.completedItemIds),
      }),
    }))
  },

  updateItemCompletion: async (userId: string, learningPathId: string, itemId: string, completed: boolean) => {
    const userPath = await learningPathRepository.updateItemCompletion(userId, learningPathId, itemId, completed)
    const role = await getUserRole(userId)

    return {
      ...userPath,
      completedItemIds: parseCompletedItemIds(userPath.completedItemIds),
      learningPath: formatLearningPath(userPath.learningPath, {
        role,
        started: true,
        status: userPath.status,
        completedItemIds: parseCompletedItemIds(userPath.completedItemIds),
      }),
    }
  },
}
