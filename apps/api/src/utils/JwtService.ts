import { User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { prisma } from '../prismaClient';

export function generateJwtSecret(user: User) {
  return jwt.sign(user.id, process.env.TOKEN_SECRET);
}

export function tokenToUser(token: string) {
  const userId = jwt.decode(token);

  if (!userId) return null;

  return prisma.user.findFirst({ where: { id: userId as string } });
}
