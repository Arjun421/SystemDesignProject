import { BaseWorkflow } from './base-workflow.template'
import { forbidden, notFound } from '../errors/app-error'
import { courseRepository } from '../repositories/course.repository'
import { userRepository } from '../repositories/user.repository'

interface EnrollInput {
  userId: string
  courseId: string
}

export class EnrollWorkflow extends BaseWorkflow<EnrollInput, unknown> {
  protected async validate({ userId, courseId }: EnrollInput): Promise<void> {
    const [course, user] = await Promise.all([
      courseRepository.findById(courseId),
      userRepository.findById(userId),
    ])

    if (!course) {
      throw notFound('Course not found')
    }

    if (!user) {
      throw notFound('User not found')
    }

    if (course.resource.isPremium && user.role === 'FREE') {
      throw forbidden('Premium subscription required')
    }
  }

  protected async execute({ userId, courseId }: EnrollInput): Promise<unknown> {
    return courseRepository.enroll(userId, courseId)
  }

  protected async postProcess(_input: EnrollInput, result: any): Promise<void> {
    console.log(`[EnrollWorkflow] Enrolled. Enrollment ID: ${result.id}`)
  }
}
