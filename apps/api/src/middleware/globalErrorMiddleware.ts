import { NextFunction, Response } from 'express';
import { NotFoundError } from '../errors/NotFoundError';
import { ApiRequest } from '../types/ApiRequest';
import {ApiError} from "../errors/ApiError";


export const buildError = (type: string, error: Error) => {
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
  switch(err.constructor.name){
    case 'NotFoundError':
      res.status(404).json(buildError('not-found', err));
      break;
    case 'ApiError':
      res.status((err as ApiError).status).json(buildError(err.message, err));
      break;
    default:
      res.status(500).json(buildError('server-error', err));
      break;
  }
  next(err);
}
