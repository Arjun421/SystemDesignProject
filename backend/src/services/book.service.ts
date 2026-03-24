import { BorrowWorkflow, ReturnWorkflow } from '../patterns/borrow-workflow.template'
import { bookRepository } from '../repositories/book.repository'
import prisma from '../config/prisma'

const borrowWorkflow = new BorrowWorkflow()
const returnWorkflow = new ReturnWorkflow()

export const bookService = {
  borrowBook: (userId: string, bookId: string) => {
    return borrowWorkflow.run({ userId, bookId })
  },

  returnBook: (userId: string, bookId: string) => {
    return returnWorkflow.run({ userId, bookId })
  },

  getBorrowHistory: (userId: string) => {
    return prisma.borrowRecord.findMany({
      where: { userId },
      include: { book: { include: { resource: true } } },
      orderBy: { borrowedAt: 'desc' },
    })
  },

  getActiveBorrows: (userId: string) => {
    return prisma.borrowRecord.findMany({
      where: { userId, status: 'ACTIVE' },
      include: { book: { include: { resource: true } } },
    })
  },
}
