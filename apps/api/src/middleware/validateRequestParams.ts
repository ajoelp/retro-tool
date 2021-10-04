import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ValidationError } from '../errors/ValidationError';
import { ApiRequest } from '../types/ApiRequest';

const validateRequestParameters = (
  req: ApiRequest,
  res: Response,
  next: NextFunction,
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(new ValidationError('Validation error'));
  }
  next();
};

export default validateRequestParameters;
