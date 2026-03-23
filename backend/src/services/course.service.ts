import { courseRepository } from '../repositories/course.repository'
import { userRepository } from '../repositories/user.repository'

export const courseService = {
  enrollUser: async (userId: string, courseId: string) => {
    const course = await courseRepository.findById(courseId)
    if (!course) throw { status: 404, message: 'Course not found' }

    const user = await userRepository.findById(userId)
    if (course.resource.isPremium && user?.role === 'FREE') {
      throw { status: 403, message: 'Premium subscription required' }
    }

    return courseRepository.enroll(userId, courseId)
  },

  updateProgress: async (userId: string, courseId: string, progress: number) => {
    if (progress < 0 || progress > 100) {
      throw { status: 400, message: 'Progress must be between 0 and 100' }
    }
    return courseRepository.updateProgress(userId, courseId, progress)
  },
}
