import { NextFunction, Response } from 'express';
import { NotFoundError } from '../errors/NotFoundError';
import { ApiRequest } from '../types/ApiRequest';
import {ApiError} from "../errors/ApiError";
import {AuthenticationError} from "../errors/AuthenticationError";
import {Analytics} from "../utils/Analytics";

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
  _next: NextFunction,
) {
  switch(err.constructor.name){
    case AuthenticationError.name:
      return res.status(401).json(buildError('unauthorized', err));
    case NotFoundError.name:
      return res.status(404).json(buildError('not-found', err));
    case ApiError.name:
      return res.status((err as ApiError).status).json(buildError(err.message, err));
    default:
      Analytics.handleSentryError(err);
      return res.status(500).json(buildError('server-error', err));
  }
}
