import { User } from '.prisma/client';
import { NextFunction, Response } from 'express';
import { prisma } from '../prismaClient';
import { ApiRequest } from '../types/ApiRequest';

export async function hasAccessToBoard(
  req: ApiRequest,
  res: Response,
  next: NextFunction,
) {
  next();
}

export const CardAccessError = 'User does not have access to edit this card.';

export async function canEditCard(
  req: ApiRequest,
  res: Response,
  next: NextFunction,
) {
  const { cardId } = req.params;

  if (!cardId) throw new Error(CardAccessError);

  const user = req.user as User;
  const card = await prisma.card.findFirst({ where: { id: cardId }, include: { column: { include: { board: { select: { ownerId: true  }}}}}});

  if (!card || !user) {
    throw new Error(CardAccessError);
  }

  if(user.id !== card.ownerId && user.id !== card.column.board.ownerId) {
    throw new Error(CardAccessError);
  }

  next();
}
