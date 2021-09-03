import { prisma } from '../prismaClient';
import { CARD_UPDATED_EVENT_NAME } from '@retro-tool/api-interfaces';
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
}
