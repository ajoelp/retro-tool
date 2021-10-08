import { NextFunction, Response } from 'express';
import { NotFoundError } from '../errors/NotFoundError';
import { ApiRequest } from '../types/ApiRequest';


const buildError = (type: string, error: Error) => {
  const response: any = {
    error: type,
    message: error.message
  }

  if (process.env.NODE_ENV !== 'production') {
    response.trace = error.stack
  }
  return response
}

export default function globalErrorMiddleware(
  err: Error,
  req: ApiRequest,
  res: Response,
  next: NextFunction,
): void {
  if (err instanceof NotFoundError) {
    res.status(404).json(buildError('not-found', err));
  } else {
    res.status(500).json(buildError('server-error', err));
  }
  next(err);
}
