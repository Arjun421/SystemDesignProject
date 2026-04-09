import { EnrollmentStatus, Prisma } from '@prisma/client'
import prisma from '../config/prisma'
import { conflict, notFound } from '../errors/app-error'
import { normalizeCourseModules } from '../utils/course-modules'

type TransactionClient = Omit<
  Prisma.TransactionClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

const recalculateEnrollmentState = async (tx: TransactionClient, enrollmentId: string) => {
  const moduleProgress = await tx.courseModuleProgress.findMany({
    where: { enrollmentId },
    orderBy: { moduleIndex: 'asc' },
  })

  const totalModules = moduleProgress.length
  const completedModules = moduleProgress.filter((module) => module.completed).length
  const progressPercent = totalModules === 0
    ? 0
    : Math.round((completedModules / totalModules) * 100)

  const isCompleted = totalModules > 0 && completedModules === totalModules

  await tx.enrollment.update({
    where: { id: enrollmentId },
    data: {
      progressPercent,
      status: isCompleted ? EnrollmentStatus.COMPLETED : EnrollmentStatus.ACTIVE,
      completedAt: isCompleted ? new Date() : null,
    },
  })
}

const ensureModuleProgressForEnrollment = async (
  tx: TransactionClient,
  enrollmentId: string,
  rawModules: unknown
) => {
  const normalizedModules = normalizeCourseModules(rawModules)

  if (normalizedModules.length === 0) {
    return
  }

  await tx.courseModuleProgress.createMany({
    data: normalizedModules.map((module) => ({
      enrollmentId,
      moduleId: module.id,
      moduleIndex: module.moduleIndex,
      title: module.title,
    })),
    skipDuplicates: true,
  })
}

const enrollmentInclude = {
  course: { include: { resource: true } },
  moduleProgress: {
    orderBy: { moduleIndex: 'asc' as const },
  },
}

export const courseRepository = {
  findById: (id: string) => {
    return prisma.course.findUnique({
      where: { id },
      include: { resource: true },
    })
  },

  enroll: async (userId: string, courseId: string) => {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
      })

      if (existing) {
        throw conflict('Already enrolled in this course')
      }

      const course = await tx.course.findUnique({
        where: { id: courseId },
      })

      if (!course) {
        throw notFound('Course not found')
      }

      const enrollment = await tx.enrollment.create({
        data: { userId, courseId },
      })

      await ensureModuleProgressForEnrollment(tx, enrollment.id, course.modules)
      await recalculateEnrollmentState(tx, enrollment.id)

      return tx.enrollment.findUniqueOrThrow({
        where: { id: enrollment.id },
        include: enrollmentInclude,
      })
    })
  },

  myEnrollments: async (userId: string) => {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: enrollmentInclude,
      orderBy: { enrolledAt: 'desc' },
    })

    await prisma.$transaction(async (tx) => {
      for (const enrollment of enrollments) {
        await ensureModuleProgressForEnrollment(tx, enrollment.id, enrollment.course.modules)
        await recalculateEnrollmentState(tx, enrollment.id)
      }
    })

    return prisma.enrollment.findMany({
      where: { userId },
      include: enrollmentInclude,
      orderBy: { enrolledAt: 'desc' },
    })
  },

  updateProgress: async (userId: string, courseId: string, progress: number) => {
    return prisma.$transaction(async (tx) => {
      const enrollment = await tx.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
        include: {
          course: true,
          moduleProgress: {
            orderBy: { moduleIndex: 'asc' },
          },
        },
      })

      if (!enrollment) {
        throw notFound('Enrollment not found')
      }

      await ensureModuleProgressForEnrollment(tx, enrollment.id, enrollment.course.modules)

      const moduleProgress = await tx.courseModuleProgress.findMany({
        where: { enrollmentId: enrollment.id },
        orderBy: { moduleIndex: 'asc' },
      })

      const totalModules = moduleProgress.length
      const targetCompleted = totalModules === 0
        ? 0
        : Math.round((progress / 100) * totalModules)

      for (const [index, module] of moduleProgress.entries()) {
        const shouldBeCompleted = index < targetCompleted
        await tx.courseModuleProgress.update({
          where: { id: module.id },
          data: {
            completed: shouldBeCompleted,
            completedAt: shouldBeCompleted ? module.completedAt ?? new Date() : null,
          },
        })
      }

      await recalculateEnrollmentState(tx, enrollment.id)

      return tx.enrollment.findUniqueOrThrow({
        where: { id: enrollment.id },
        include: enrollmentInclude,
      })
    })
  },

  updateModuleProgress: async (userId: string, courseId: string, moduleId: string, completed: boolean) => {
    return prisma.$transaction(async (tx) => {
      const enrollment = await tx.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
        include: {
          course: true,
        },
      })

      if (!enrollment) {
        throw notFound('Enrollment not found')
      }

      await ensureModuleProgressForEnrollment(tx, enrollment.id, enrollment.course.modules)

      const moduleProgress = await tx.courseModuleProgress.findFirst({
        where: {
          enrollmentId: enrollment.id,
          moduleId,
        },
      })

      if (!moduleProgress) {
        throw notFound('Course module not found')
      }

      await tx.courseModuleProgress.update({
        where: { id: moduleProgress.id },
        data: {
          completed,
          completedAt: completed ? moduleProgress.completedAt ?? new Date() : null,
        },
      })

      await recalculateEnrollmentState(tx, enrollment.id)

      return tx.enrollment.findUniqueOrThrow({
        where: { id: enrollment.id },
        include: enrollmentInclude,
      })
    })
  },

  getUserEnrolledResourceIds: async (userId: string) => {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      select: {
        course: {
          select: {
            resource: {
              select: { id: true },
            },
          },
        },
      },
    })

    return enrollments.map((enrollment) => enrollment.course.resource.id)
  },
}
