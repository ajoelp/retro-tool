import { Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { namespaceInstance } from '../sockets';
import { CARD_CREATED_EVENT_NAME } from '@retro-tool/api-interfaces';
import { User } from '@prisma/client';

export class CardsController {
  async list(req: Request, res: Response) {
    const { columnId } = req.query;

    if (columnId == null) throw new Error('No columnId provided');

    const cards = await prisma.card.findMany({
      where: {
        columnId: columnId as string,
      },
      include: {
        owner: true,
      },
    });

    return res.json({ cards });
  }

  async create(req: Request, res: Response) {
    const { columnId, content } = req.body;
    const card = await prisma.card.create({
      data: {
        content,
        ownerId: (req.user as User).id,
        columnId,
      },
      include: {
        column: true,
        owner: true,
      },
    });

    namespaceInstance.sendEventToBoard(card.column.boardId, {
      type: CARD_CREATED_EVENT_NAME,
      payload: card,
    });

    return res.json({ card });
  }
}
