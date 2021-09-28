import { User } from ".prisma/client";
import { NextFunction, Request, Response } from "express";
import { prisma } from "../prismaClient";

export async function hasAccessToBoard(req: Request, res: Response, next: NextFunction) {
  next()
}


const CardAccessError = 'User does not have access to edit this card.'

export async function canEditCard(req: Request, res: Response, next: NextFunction) {

  const { cardId } = req.params;

  if (!cardId) throw new Error(CardAccessError)

  const user = req.user as User
  const card = await prisma.card.findFirst({ where: { id: cardId } })

  if (!card || !user || user.id !== card.ownerId) throw new Error(CardAccessError)

  next();
}
