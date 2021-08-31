import { User } from '@prisma/client';
import { Response, Request, NextFunction } from 'express';
import { AuthenticationError } from '../errors/AuthenticationError';
import { tokenToUser } from '../utils/JwtService';

export async function authenticatedMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.get('Authorization');

  if (!authHeader) throw new AuthenticationError('No token provided');

  const [, token] = authHeader.split(' ');

  const user = await tokenToUser(token);

  if (!user) throw new AuthenticationError('Invalid credentials');

  req.user = user as User;

  return next();
}
