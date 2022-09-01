import { User } from '@prisma/client';
import { NextFunction, Response } from 'express';
import { AuthenticationError } from '../errors/AuthenticationError';
import { ApiRequest } from '../types/ApiRequest';
import { tokenToUser } from '../utils/JwtService';
import {Analytics} from "../utils/Analytics";

export async function authenticatedMiddleware(
  req: ApiRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.get('Authorization');

  if (!authHeader) throw new AuthenticationError('No token provided');

  const [, token] = authHeader.split(' ');

  const user = await tokenToUser(token);

  if (!user) throw new AuthenticationError('Invalid credentials');

  req.user = user as User;

  Analytics.attachContext(user);

  return next();
}
