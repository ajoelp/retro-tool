import { User } from '@prisma/client';
import { Request, Response } from 'express';
import { prisma } from '../prismaClient';

export class InvitesController {
  async acceptInvite(req: Request, res: Response) {
    const inviteCode = req.params.inviteCode;

    const board = await prisma.board.findFirst({ where: { inviteCode } });

    const boardAccess = await prisma.boardAccess.findFirst({
      where: {
        userId: (req.user as User).id,
        boardId: board.id,
      },
    });

    if (!boardAccess) {
      await prisma.boardAccess.create({
        data: {
          userId: (req.user as User).id,
          boardId: board.id,
        },
      });
    }

    res.json({ board });
  }
}
