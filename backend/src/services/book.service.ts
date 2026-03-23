import { bookRepository } from '../repositories/book.repository'
import { userRepository } from '../repositories/user.repository'

export const bookService = {
  borrowBook: async (userId: string, bookId: string) => {
    const book = await bookRepository.findById(bookId)
    if (!book) throw { status: 404, message: 'Book not found' }

    // Premium access check
    const user = await userRepository.findById(userId)
    if (book.resource.isPremium && user?.role === 'FREE') {
      throw { status: 403, message: 'Premium subscription required' }
    }

    return bookRepository.borrow(userId, bookId)
  },

  returnBook: async (userId: string, bookId: string) => {
    const book = await bookRepository.findById(bookId)
    if (!book) throw { status: 404, message: 'Book not found' }

    return bookRepository.return(userId, bookId)
  },
}
