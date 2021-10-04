import { User } from '.prisma/client';
import { Request } from 'express';

export interface ApiRequest extends Request {
  user?: User;
}
