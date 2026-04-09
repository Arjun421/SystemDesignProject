import { NextFunction, Request, Response } from 'express'

type AsyncRequestHandler<TRequest extends Request = Request> = (
  req: TRequest,
  res: Response,
  next: NextFunction
) => Promise<void>

export const asyncHandler = <TRequest extends Request>(handler: AsyncRequestHandler<TRequest>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(handler(req as TRequest, res, next)).catch(next)
  }
