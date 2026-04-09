import { BorrowWorkflow, ReturnWorkflow } from '../patterns/borrow-workflow.template'
import { bookRepository } from '../repositories/book.repository'

const borrowWorkflow = new BorrowWorkflow()
const returnWorkflow = new ReturnWorkflow()

export const bookService = {
  borrowBook: async (userId: string, bookId: string) => {
    await bookRepository.markOverdueBorrows(userId)
    return borrowWorkflow.run({ userId, bookId })
  },

  returnBook: async (userId: string, bookId: string) => {
    await bookRepository.markOverdueBorrows(userId)
    return returnWorkflow.run({ userId, bookId })
  },

  getBorrowHistory: (userId: string) => {
    return bookRepository.getBorrowHistory(userId)
  },

  getActiveBorrows: (userId: string) => {
    return bookRepository.getActiveBorrows(userId)
  },
}
