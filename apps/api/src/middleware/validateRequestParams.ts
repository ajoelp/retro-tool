import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ValidationError } from '../errors/ValidationError';

const validateRequestParameters = (
  req: Request,
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
