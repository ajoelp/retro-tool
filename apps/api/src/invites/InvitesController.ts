import { ApiRequest } from './../types/ApiRequest.d';
import { User } from '@prisma/client';
import { Response } from 'express';
import { NotFoundError } from '../errors/NotFoundError';

import { prisma } from '../prismaClient';

export class InvitesController {
  async acceptInvite(req: ApiRequest, res: Response) {
    const inviteCode = req.params.inviteCode;

    const board = await prisma.board.findFirst({ where: { inviteCode } });

    if (!board) {
      throw new NotFoundError(`Board with inviteCode ${inviteCode} not found`);
    }

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
