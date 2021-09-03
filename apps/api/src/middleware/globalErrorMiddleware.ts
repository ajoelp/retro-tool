import { NextFunction, Request, Response } from 'express';
import { NotFoundError } from '../errors/NotFoundError';

export default function globalErrorMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    return next();
  } catch (err) {
    if (err instanceof NotFoundError) {
      res.status(404).json({
        error: 'not-found',
        message: err.message,
      });
    } else {
      res.status(500).json({
        error: 'server-error',
        message: err.message,
      });
    }
  }
}
