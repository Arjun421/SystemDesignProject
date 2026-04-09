import { EnrollWorkflow } from '../patterns/enroll-workflow.template'
import { courseRepository } from '../repositories/course.repository'
import { normalizeCourseModules } from '../utils/course-modules'

const enrollWorkflow = new EnrollWorkflow()

const formatEnrollment = <T extends {
  moduleProgress: Array<{ moduleId: string; completed: boolean; completedAt: Date | null; moduleIndex: number; title: string }>
  course: { modules: unknown }
}>(enrollment: T) => {
  const normalizedModules = normalizeCourseModules(enrollment.course.modules)

  const modules = normalizedModules.map((module) => {
    const progress = enrollment.moduleProgress.find((item) => item.moduleId === module.id)

    return {
      id: module.id,
      title: module.title,
      moduleIndex: module.moduleIndex,
      completed: progress?.completed ?? false,
      completedAt: progress?.completedAt ?? null,
    }
  })

  return {
    ...enrollment,
    completedModuleCount: modules.filter((module) => module.completed).length,
    totalModules: modules.length,
    modules,
  }
}

export const courseService = {
  enrollUser: async (userId: string, courseId: string) => {
    const enrollment = await enrollWorkflow.run({ userId, courseId }) as Awaited<ReturnType<typeof courseRepository.enroll>>
    return formatEnrollment(enrollment)
  },

  updateProgress: async (userId: string, courseId: string, progress: number) => {
    const enrollment = await courseRepository.updateProgress(userId, courseId, progress)
    return formatEnrollment(enrollment)
  },

  updateModuleProgress: async (userId: string, courseId: string, moduleId: string, completed: boolean) => {
    const enrollment = await courseRepository.updateModuleProgress(userId, courseId, moduleId, completed)
    return formatEnrollment(enrollment)
  },

  myEnrollments: async (userId: string) => {
    const enrollments = await courseRepository.myEnrollments(userId)
    return enrollments.map(formatEnrollment)
  },
}
