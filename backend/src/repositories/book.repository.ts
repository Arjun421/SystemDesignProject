import prisma from '../config/prisma'

export const bookRepository = {
  findById: (id: string) => {
    return prisma.book.findUnique({
      where: { id },
      include: { resource: true },
    })
  },

  borrow: async (userId: string, bookId: string) => {
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 14) // 14 day borrow period

    return prisma.$transaction(async (tx) => {
      // Lock the book row and check availability
      const book = await tx.book.findUnique({ where: { id: bookId } })
      if (!book || book.availableCopies <= 0) {
        throw { status: 409, message: 'No copies available' }
      }

      // Check borrow limit (max 3)
      const activeCount = await tx.borrowRecord.count({
        where: { userId, status: 'ACTIVE' },
      })
      if (activeCount >= 3) {
        throw { status: 409, message: 'Borrow limit reached (max 3)' }
      }

      // Check duplicate borrow
      const existing = await tx.borrowRecord.findFirst({
        where: { userId, bookId, status: 'ACTIVE' },
      })
      if (existing) throw { status: 409, message: 'Already borrowed this book' }

      // Create record and decrement copies atomically
      const [record] = await Promise.all([
        tx.borrowRecord.create({ data: { userId, bookId, dueDate } }),
        tx.book.update({
          where: { id: bookId },
          data: { availableCopies: { decrement: 1 } },
        }),
      ])

      return record
    })
  },

  return: async (userId: string, bookId: string) => {
    return prisma.$transaction(async (tx) => {
      const record = await tx.borrowRecord.findFirst({
        where: { userId, bookId, status: 'ACTIVE' },
      })
      if (!record) throw { status: 404, message: 'No active borrow record found' }

      const [updated] = await Promise.all([
        tx.borrowRecord.update({
          where: { id: record.id },
          data: { status: 'RETURNED', returnedAt: new Date() },
        }),
        tx.book.update({
          where: { id: bookId },
          data: { availableCopies: { increment: 1 } },
        }),
      ])

      return updated
    })
  },
}
