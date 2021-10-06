import { prisma } from '../prismaClient';
import {
  CARD_DELETED_EVENT_NAME,
  CARD_UPDATED_EVENT_NAME,
} from '@retro-tool/api-interfaces';
import dependencies from '../dependencies';

export class CardRepository {
  async getNextOrderValue(columnId: string) {
    const lastCard = await prisma.card.findFirst({
      where: { columnId },
      orderBy: { order: 'desc' },
    });
    return lastCard ? lastCard.order + 1 : 0;
  }

  async reorderCards(columnId: string, boardId: string) {
    const cards = await prisma.card.findMany({
      where: { columnId },
      orderBy: { order: 'asc' },
    });
    for (const [index, card] of cards.entries()) {
      if (card.order !== index) {
        const updatedCard = await prisma.card.update({
          where: { id: card.id },
          data: { order: index },
        });
        dependencies.namespaceService.sendEventToBoard(boardId, {
          type: CARD_UPDATED_EVENT_NAME,
          payload: updatedCard,
        });
      }
    }
  }

  getCardById(id: string) {
    return prisma.card.findFirst({
      where: { id },
      include: { children: true, column: true, owner: true },
    });
  }

  async vote(id: string, increment: boolean) {
    const method = increment ? 'increment' : 'decrement';

    const card = await prisma.card.update({
      where: {
        id,
      },
      data: {
        votes: { [method]: 1 },
      },
      include: {
        children: true,
        column: true,
        owner: true,
      },
    });

    dependencies.namespaceService.sendEventToBoard(card.column.boardId, {
      type: CARD_UPDATED_EVENT_NAME,
      payload: card,
    });
  }

  async updateCard(id: string, payload: any) {
    const card = await prisma.card.update({
      where: {
        id,
      },
      data: payload,
      include: {
        children: true,
        column: true,
        owner: true,
      },
    });

    dependencies.namespaceService.sendEventToBoard(card.column.boardId, {
      type: CARD_UPDATED_EVENT_NAME,
      payload: card,
    });

    // If the cards are grouped
    if (payload.parentId != null) {
      const parentCard = await this.getCardById(payload.parentId);

      dependencies.namespaceService.sendEventToBoard(card.column.boardId, {
        type: CARD_UPDATED_EVENT_NAME,
        payload: parentCard,
      });

      if (card.children && card.children.length) {
        for (const childCard of card.children) {
          await this.updateCard(childCard.id, { parentId: payload.parentId });
        }
      }
    }

    // If a group is moved to a new column
    if (payload.columnId != null && card.children.length > 0) {
      for (const child of card.children) {
        await this.updateCard(child.id, payload);
      }
    }

    return card;
  }

  async deleteCard(id: string) {
    const card = await prisma.card.findFirst({
      where: {
        id,
      },
      include: {
        children: true,
        column: true,
        owner: true,
      },
    });

    await prisma.card.delete({
      where: { id },
    });

    dependencies.namespaceService.sendEventToBoard(card.column.boardId, {
      type: CARD_DELETED_EVENT_NAME,
      payload: card,
    });
  }
}
