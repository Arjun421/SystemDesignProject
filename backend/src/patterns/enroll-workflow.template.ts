/**
 * EnrollWorkflow — extends BaseWorkflow
 * Fixed steps: validate → execute (enroll) → postProcess
 */

import { BaseWorkflow } from './base-workflow.template'
import { courseRepository } from '../repositories/course.repository'
import { userRepository } from '../repositories/user.repository'

interface EnrollInput {
  userId: string
  courseId: string
}

export class EnrollWorkflow extends BaseWorkflow<EnrollInput, any> {
  protected async validate({ userId, courseId }: EnrollInput): Promise<void> {
    const course = await courseRepository.findById(courseId)
    if (!course) throw { status: 404, message: 'Course not found' }

    const user = await userRepository.findById(userId)
    if (!user) throw { status: 404, message: 'User not found' }

    if (course.resource.isPremium && user.role === 'FREE') {
      throw { status: 403, message: 'Premium subscription required' }
    }
  }

  protected async execute({ userId, courseId }: EnrollInput): Promise<any> {
    return courseRepository.enroll(userId, courseId)
  }

  protected async postProcess(_input: EnrollInput, result: any): Promise<void> {
    console.log(`[EnrollWorkflow] Enrolled. Enrollment ID: ${result.id}`)
  }
}
