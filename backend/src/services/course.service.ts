import { EnrollWorkflow } from '../patterns/enroll-workflow.template'
import { courseRepository } from '../repositories/course.repository'

const enrollWorkflow = new EnrollWorkflow()

export const courseService = {
  enrollUser: (userId: string, courseId: string) => {
    return enrollWorkflow.run({ userId, courseId })
  },

  updateProgress: async (userId: string, courseId: string, progress: number) => {
    if (progress < 0 || progress > 100) {
      throw { status: 400, message: 'Progress must be between 0 and 100' }
    }
    return courseRepository.updateProgress(userId, courseId, progress)
  },

  myEnrollments: (userId: string) => {
    return courseRepository.myEnrollments(userId)
  },
}
