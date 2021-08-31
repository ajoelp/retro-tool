import { Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { namespaceInstance } from '../sockets';
import { CARD_CREATED_EVENT_NAME } from '../../../../libs/api-interfaces/src/lib/socket-events';

export class CardsController {
  async list(req: Request, res: Response) {
    const { columnId } = req.query;

    if (columnId == null) throw new Error('No columnId provided');

    const cards = await prisma.card.findMany({
      where: {
        columnId: columnId as string,
      },
    });

    return res.json({ cards });
  }

  async create(req: Request, res: Response) {
    const { columnId, content, ownerId } = req.body;
    const card = await prisma.card.create({
      data: {
        content,
        ownerId,
        columnId,
      },
      include: {
        column: true,
      },
    });

    namespaceInstance.sendEventToBoard(card.column.boardId, {
      type: CARD_CREATED_EVENT_NAME,
      payload: card,
    });

    return res.json({ card });
  }
}
