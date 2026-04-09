import { Prisma } from '@prisma/client'
import prisma from '../config/prisma'
import { conflict, notFound } from '../errors/app-error'

const activeBorrowStatuses = ['ACTIVE', 'OVERDUE'] as const

export const bookRepository = {
  findById: (id: string) => {
    return prisma.book.findUnique({
      where: { id },
      include: { resource: true },
    })
  },

  markOverdueBorrows: async (userId?: string) => {
    await prisma.borrowRecord.updateMany({
      where: {
        ...(userId && { userId }),
        status: 'ACTIVE',
        dueDate: { lt: new Date() },
      },
      data: { status: 'OVERDUE' },
    })
  },

  borrow: async (userId: string, bookId: string) => {
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 14)

    return prisma.$transaction(async (tx) => {
      const activeCount = await tx.borrowRecord.count({
        where: {
          userId,
          status: { in: [...activeBorrowStatuses] },
        },
      })
      if (activeCount >= 3) {
        throw conflict('Borrow limit reached (max 3)')
      }

      const existing = await tx.borrowRecord.findFirst({
        where: {
          userId,
          bookId,
          status: { in: [...activeBorrowStatuses] },
        },
      })
      if (existing) {
        throw conflict('Already borrowed this book')
      }

      const decremented = await tx.book.updateMany({
        where: {
          id: bookId,
          availableCopies: { gt: 0 },
        },
        data: {
          availableCopies: { decrement: 1 },
        },
      })

      if (decremented.count === 0) {
        throw conflict('No copies available')
      }

      return tx.borrowRecord.create({
        data: { userId, bookId, dueDate },
      })
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    })
  },

  return: async (userId: string, bookId: string) => {
    return prisma.$transaction(async (tx) => {
      const record = await tx.borrowRecord.findFirst({
        where: {
          userId,
          bookId,
          status: { in: [...activeBorrowStatuses] },
        },
      })

      if (!record) {
        throw notFound('No active borrow record found')
      }

      const updated = await tx.borrowRecord.update({
        where: { id: record.id },
        data: {
          status: 'RETURNED',
          returnedAt: new Date(),
        },
      })

      await tx.book.update({
        where: { id: bookId },
        data: {
          availableCopies: { increment: 1 },
        },
      })

      return updated
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    })
  },

  getBorrowHistory: async (userId: string) => {
    await bookRepository.markOverdueBorrows(userId)

    return prisma.borrowRecord.findMany({
      where: { userId },
      include: { book: { include: { resource: true } } },
      orderBy: { borrowedAt: 'desc' },
    })
  },

  getActiveBorrows: async (userId: string) => {
    await bookRepository.markOverdueBorrows(userId)

    return prisma.borrowRecord.findMany({
      where: {
        userId,
        status: { in: [...activeBorrowStatuses] },
      },
      include: { book: { include: { resource: true } } },
      orderBy: { dueDate: 'asc' },
    })
  },

  getUserBorrowedResourceIds: async (userId: string) => {
    const records = await prisma.borrowRecord.findMany({
      where: { userId },
      select: {
        book: {
          select: {
            resource: {
              select: { id: true },
            },
          },
        },
      },
    })

    return records.map((record) => record.book.resource.id)
  },
}
