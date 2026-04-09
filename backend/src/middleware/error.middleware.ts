import { NextFunction, Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'
import { AppError } from '../errors/app-error'

export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(404, 'Route not found', 'ROUTE_NOT_FOUND'))
}

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
      ...(err.details !== undefined && { details: err.details }),
    })
    return
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: err.flatten(),
    })
    return
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P1003') {
      res.status(503).json({
        success: false,
        error: 'The configured PostgreSQL database does not exist',
        code: 'DATABASE_DOES_NOT_EXIST',
        details: err.meta,
      })
      return
    }

    if (err.code === 'P2002') {
      res.status(409).json({
        success: false,
        error: 'A unique constraint would be violated by this request',
        code: 'UNIQUE_CONSTRAINT_VIOLATION',
        details: err.meta,
      })
      return
    }

    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: 'Requested record was not found',
        code: 'RECORD_NOT_FOUND',
      })
      return
    }
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    res.status(503).json({
      success: false,
      error: 'Database connection failed during Prisma initialization',
      code: err.errorCode || 'PRISMA_INIT_ERROR',
      details: err.message,
    })
    return
  }

  console.error(err)
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
  })
}
