import { Response } from 'express';
import { prisma } from '../prismaClient';
import {
  CARD_CREATED_EVENT_NAME,
  CARD_FOCUS_EVENT_NAME,
} from '@retro-tool/api-interfaces';
import { User } from '@prisma/client';
import dependencies from '../dependencies';
import { CardRepository } from './CardRepository';
import { ApiRequest } from '../types/ApiRequest';

const cardRepository = new CardRepository();

export class CardsController {
  async list(req: ApiRequest, res: Response) {
    const { columnId, parentId = null } = req.query;

    if (columnId == null) throw new Error('No columnId provided');

    const cards = await prisma.card.findMany({
      where: {
        columnId: columnId as string,
        parent: parentId ? { id: parentId as string } : null,
        draft: false,
      },
      orderBy: { createdAt: 'asc' },
      include: {
        children: {
          include: { owner: true },
        },
        owner: true,
      },
    });

    return res.json({ cards });
  }

  async create(req: ApiRequest, res: Response) {
    const { columnId, content, draft = false } = req.body;
    const card = await prisma.card.create({
      data: {
        content,
        draft,
        ownerId: (req.user as User).id,
        columnId,
        order: await cardRepository.getNextOrderValue(columnId),
      },
      include: {
        children: {
          include: { owner: true },
        },
        column: true,
        owner: true,
      },
    });

    if (card.draft) {
      dependencies.namespaceService.sendEventToUser(card.ownerId, card.column.boardId, {
        type: CARD_CREATED_EVENT_NAME,
        payload: card,
      })
    } else {
      dependencies.namespaceService.sendEventToBoard(card.column.boardId, {
        type: CARD_CREATED_EVENT_NAME,
        payload: card,
      });
    }

    return res.json({ card });
  }

  async update(req: ApiRequest, res: Response) {
    const { cardId } = req.params;
    const { payload } = req.body;

    const card = await cardRepository.updateCard(cardId, payload);

    return res.json({ card });
  }

  async vote(req: ApiRequest, res: Response) {
    const { cardId } = req.params;
    const { increment = true } = req.body;
    const card = await cardRepository.vote(cardId, increment);
    return res.json({ card });
  }

  async delete(req: ApiRequest, res: Response) {
    const { cardId } = req.params;

    await cardRepository.deleteCard(cardId);

    return res.send();
  }

  async focus(req: ApiRequest, res: Response) {
    const { cardId } = req.params;

    const card = await prisma.card.findFirst({
      where: {
        id: cardId as string,
      },
      include: {
        column: true,
      },
    });

    dependencies.namespaceService.sendEventToBoard(card.column.boardId, {
      type: CARD_FOCUS_EVENT_NAME,
      payload: card,
    });

    return res.send();
  }

  async publish(req: ApiRequest, res: Response) {
    const { boardId } = req.params;

    const query = {
      draft: true,
      ownerId: req.user.id,
      column: {
        boardId: boardId
      }
    }

    const cards = await prisma.card.findMany({
      where: query,
      include: { column: true }
    });

    await prisma.card.updateMany({
      where: query,
      data: {
        draft: false
      }
    });

    cards.forEach(card => {
      dependencies.namespaceService.sendEventToBoard(card.column.boardId, {
        type: CARD_FOCUS_EVENT_NAME,
        payload: card,
      });
    })

    return res.send();
  }
}
