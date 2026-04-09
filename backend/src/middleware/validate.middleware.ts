import { NextFunction, Request, Response } from 'express'
import { ZodTypeAny } from 'zod'

interface ValidationSchemas {
  body?: ZodTypeAny
  query?: ZodTypeAny
  params?: ZodTypeAny
}

export interface ValidatedRequest extends Request {
  validatedQuery?: unknown
  validatedParams?: unknown
  validatedBody?: unknown
}

export const validateRequest = (schemas: ValidationSchemas) =>
  (req: ValidatedRequest, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.params) {
        req.validatedParams = schemas.params.parse(req.params)
      }

      if (schemas.query) {
        req.validatedQuery = schemas.query.parse(req.query)
      }

      if (schemas.body) {
        req.validatedBody = schemas.body.parse(req.body)
        req.body = req.validatedBody
      }

      next()
    } catch (error) {
      next(error)
    }
  }
