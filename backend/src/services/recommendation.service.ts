import { Prisma } from '@prisma/client'
import { bookRepository } from '../repositories/book.repository'
import { courseRepository } from '../repositories/course.repository'
import { learningPathRepository } from '../repositories/learning-path.repository'
import { resourceRepository } from '../repositories/resource.repository'
import { userRepository } from '../repositories/user.repository'

const parseStringArray = (value: Prisma.JsonValue | unknown): string[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
}

const unique = (values: string[]) => [...new Set(values)]

export const recommendationService = {
  getRecommendations: async (userId: string) => {
    const [role, startedPathIds, borrowedResourceIds, enrolledResourceIds] = await Promise.all([
      userRepository.findById(userId).then((user) => user?.role ?? 'FREE'),
      learningPathRepository.getUserStartedPathIds(userId),
      bookRepository.getUserBorrowedResourceIds(userId),
      courseRepository.getUserEnrolledResourceIds(userId),
    ])

    const engagedResourceIdsList = unique([
      ...borrowedResourceIds,
      ...enrolledResourceIds,
    ])

    const [activePaths, engagedResources, candidateResources, candidatePaths] = await Promise.all([
      learningPathRepository.myPaths(userId, 'ACTIVE'),
      resourceRepository.findByIds(engagedResourceIdsList),
      resourceRepository.findRecommendationCandidates({
        excludeIds: engagedResourceIdsList,
        limit: 50,
      }),
      learningPathRepository.findRecommendationCandidates(startedPathIds, 25),
    ])

    const engagedResourceIds = new Set(engagedResourceIdsList)

    const activePathItems = activePaths.flatMap((userPath) => {
      const completedItemIds = parseStringArray(userPath.completedItemIds)
      return userPath.learningPath.items.filter((item) => !completedItemIds.includes(item.id))
    })

    const preferredCategories = unique([
      ...activePathItems.map((item) => item.resource.category).filter((category): category is string => Boolean(category)),
      ...engagedResources
        .map((resource) => resource.category)
        .filter((category): category is string => Boolean(category)),
    ].map((category) => category.toLowerCase()))

    const preferredTags = unique([
      ...activePaths.flatMap((userPath) => parseStringArray(userPath.learningPath.tags)),
      ...activePathItems.flatMap((item) => parseStringArray(item.resource.tags)),
    ])

    const activePathResourceIds = new Set(activePathItems.map((item) => item.resourceId))

    const recommendedResources = candidateResources
      .map((resource) => {
        let score = 0
        const reasons: string[] = []
        const resourceTags = parseStringArray(resource.tags)

        if (activePathResourceIds.has(resource.id)) {
          score += 6
          reasons.push('Matches an unfinished item in your active learning path')
        }

        if (resource.category && preferredCategories.includes(resource.category.toLowerCase())) {
          score += 3
          reasons.push('Matches categories from your current learning activity')
        }

        const overlappingTags = resourceTags.filter((tag) => preferredTags.includes(tag))
        if (overlappingTags.length > 0) {
          score += overlappingTags.length * 2
          reasons.push(`Shares tags with your active learning topics: ${overlappingTags.slice(0, 3).join(', ')}`)
        }

        if (resource.isPremium && role === 'FREE') {
          reasons.push('Premium recommendation for upgrade consideration')
        }

        return {
          ...resource,
          score,
          reasons,
          ...(resource.isPremium && role === 'FREE' && { _premiumLocked: true }),
        }
      })
      .filter((resource) => resource.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)

    const recommendedPaths = candidatePaths
      .map((path) => {
        let score = 0
        const reasons: string[] = []
        const pathTags = parseStringArray(path.tags)
        const overlappingTags = pathTags.filter((tag) => preferredTags.includes(tag))

        if (overlappingTags.length > 0) {
          score += overlappingTags.length * 2
          reasons.push(`Extends your interests in ${overlappingTags.slice(0, 3).join(', ')}`)
        }

        const relatedItems = path.items.filter((item) => {
          const category = item.resource.category?.toLowerCase()
          return Boolean(category && preferredCategories.includes(category))
        })

        if (relatedItems.length > 0) {
          score += Math.min(relatedItems.length, 3)
          reasons.push('Contains resources from categories you are already exploring')
        }

        if (path.isPremium && role === 'FREE') {
          reasons.push('Premium path recommendation for upgrade consideration')
        }

        return {
          ...path,
          score,
          reasons,
          totalItems: path.items.length,
          ...(path.isPremium && role === 'FREE' && { _premiumLocked: true }),
        }
      })
      .filter((path) => path.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)

    return {
      resources: recommendedResources,
      learningPaths: recommendedPaths,
      signals: {
        preferredCategories,
        preferredTags,
      },
    }
  },
}
