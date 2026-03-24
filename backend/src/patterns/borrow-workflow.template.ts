/**
 * BorrowWorkflow — extends BaseWorkflow
 * Fixed steps: validate → execute (borrow) → postProcess (log)
 */

import { BaseWorkflow } from './base-workflow.template'
import { bookRepository } from '../repositories/book.repository'
import { userRepository } from '../repositories/user.repository'

interface BorrowInput {
  userId: string
  bookId: string
}

export class BorrowWorkflow extends BaseWorkflow<BorrowInput, any> {
  protected async validate({ userId, bookId }: BorrowInput): Promise<void> {
    const book = await bookRepository.findById(bookId)
    if (!book) throw { status: 404, message: 'Book not found' }

    const user = await userRepository.findById(userId)
    if (!user) throw { status: 404, message: 'User not found' }

    // Premium access check
    if (book.resource.isPremium && user.role === 'FREE') {
      throw { status: 403, message: 'Premium subscription required' }
    }
  }

  protected async execute({ userId, bookId }: BorrowInput): Promise<any> {
    return bookRepository.borrow(userId, bookId)
  }

  protected async postProcess(_input: BorrowInput, result: any): Promise<void> {
    // Hook: could send notification, update analytics, etc.
    console.log(`[BorrowWorkflow] Book borrowed. Record ID: ${result.id}`)
  }
}

export class ReturnWorkflow extends BaseWorkflow<BorrowInput, any> {
  protected async validate({ bookId }: BorrowInput): Promise<void> {
    const book = await bookRepository.findById(bookId)
    if (!book) throw { status: 404, message: 'Book not found' }
  }

  protected async execute({ userId, bookId }: BorrowInput): Promise<any> {
    return bookRepository.return(userId, bookId)
  }

  protected async postProcess(_input: BorrowInput, result: any): Promise<void> {
    console.log(`[ReturnWorkflow] Book returned. Record ID: ${result.id}`)
  }
}
