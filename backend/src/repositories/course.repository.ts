import prisma from '../config/prisma'

export const courseRepository = {
  findById: (id: string) => {
    return prisma.course.findUnique({
      where: { id },
      include: { resource: true },
    })
  },

  enroll: async (userId: string, courseId: string) => {
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    })
    if (existing) throw { status: 409, message: 'Already enrolled in this course' }

    return prisma.enrollment.create({
      data: { userId, courseId },
    })
  },

  updateProgress: async (userId: string, courseId: string, progress: number) => {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    })
    if (!enrollment) throw { status: 404, message: 'Enrollment not found' }
    if (enrollment.status === 'COMPLETED') throw { status: 409, message: 'Course already completed' }

    return prisma.enrollment.update({
      where: { userId_courseId: { userId, courseId } },
      data: {
        progressPercent: progress,
        ...(progress === 100 && { status: 'COMPLETED', completedAt: new Date() }),
      },
    })
  },
}
