import { BaseWorkflow } from './base-workflow.template'
import { forbidden, notFound } from '../errors/app-error'
import { bookRepository } from '../repositories/book.repository'
import { userRepository } from '../repositories/user.repository'

interface BorrowInput {
  userId: string
  bookId: string
}

export class BorrowWorkflow extends BaseWorkflow<BorrowInput, unknown> {
  protected async validate({ userId, bookId }: BorrowInput): Promise<void> {
    const [book, user] = await Promise.all([
      bookRepository.findById(bookId),
      userRepository.findById(userId),
    ])

    if (!book) {
      throw notFound('Book not found')
    }

    if (!user) {
      throw notFound('User not found')
    }

    if (book.resource.isPremium && user.role === 'FREE') {
      throw forbidden('Premium subscription required')
    }
  }

  protected async execute({ userId, bookId }: BorrowInput): Promise<unknown> {
    return bookRepository.borrow(userId, bookId)
  }

  protected async postProcess(_input: BorrowInput, result: any): Promise<void> {
    console.log(`[BorrowWorkflow] Book borrowed. Record ID: ${result.id}`)
  }
}

export class ReturnWorkflow extends BaseWorkflow<BorrowInput, unknown> {
  protected async validate({ bookId }: BorrowInput): Promise<void> {
    const book = await bookRepository.findById(bookId)
    if (!book) {
      throw notFound('Book not found')
    }
  }

  protected async execute({ userId, bookId }: BorrowInput): Promise<unknown> {
    return bookRepository.return(userId, bookId)
  }

  protected async postProcess(_input: BorrowInput, result: any): Promise<void> {
    console.log(`[ReturnWorkflow] Book returned. Record ID: ${result.id}`)
  }
}
