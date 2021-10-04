import { CardRepository } from './CardRepository';
import { prisma } from '../prismaClient';
import { Board, Card, Column, User } from '.prisma/client';
import dependencies from '../dependencies';

describe('CardRepository', () => {
  let user: User;
  let board: Board;
  let column: Column;

  beforeAll(async () => {
    user = await prisma.user.create({
      data: {
        githubNickname: 'testUser',
        email: 'test@example.com',
        avatar: '',
      },
    });
    board = await prisma.board.create({
      data: {
        title: 'board',
        ownerId: user.id,
      },
    });
    column = await prisma.column.create({
      data: {
        title: 'column',
        boardId: board.id,
        order: 0,
      },
    });
  });

  const cardRepository = new CardRepository();

  describe('getNextOrderValue', () => {
    it('it will get the next order value', async () => {
      await prisma.card.create({
        data: {
          content: 'card',
          columnId: column.id,
          order: 2,
          ownerId: user.id,
        },
      });
      expect(await cardRepository.getNextOrderValue(column.id)).toEqual(3);
    });
  });

  describe('reorderColumns', () => {
    it("will reorder cards that don't match", async () => {
      const card1 = await prisma.card.create({
        data: {
          content: 'card',
          columnId: column.id,
          order: 0,
          ownerId: user.id,
        },
      });
      const card2 = await prisma.card.create({
        data: {
          content: 'card',
          columnId: column.id,
          order: 1,
          ownerId: user.id,
        },
      });
      const card3 = await prisma.card.create({
        data: {
          content: 'card',
          columnId: column.id,
          order: 3,
          ownerId: user.id,
        },
      });
      await cardRepository.reorderCards(column.id, board.id);

      expect(await prisma.card.findFirst({ where: { id: card1.id } })).toEqual(
        expect.objectContaining({ order: 0 }),
      );

      expect(await prisma.card.findFirst({ where: { id: card2.id } })).toEqual(
        expect.objectContaining({ order: 1 }),
      );

      expect(await prisma.card.findFirst({ where: { id: card3.id } })).toEqual(
        expect.objectContaining({ order: 2 }),
      );
    });
  });

  describe('getCardById', () => {
    it('will get a card by id', async () => {
      const card = await prisma.card.create({
        data: {
          content: 'card',
          columnId: column.id,
          order: 2,
          ownerId: user.id,
        },
      });
      expect(await cardRepository.getCardById(card.id)).toEqual(
        expect.objectContaining({
          id: card.id,
          content: card.content,
        }),
      );
    });
  });

  describe('updateCard', () => {
    function createCard(parentId?: string) {
      return prisma.card.create({
        data: {
          content: 'card',
          columnId: column.id,
          order: 2,
          ownerId: user.id,
          parentId,
        },
      });
    }

    function reloadCard(card: Card) {
      return prisma.card.findFirst({ where: { id: card.id } });
    }

    it('will update a card', async () => {
      const sendEventToBoard = jest
        .spyOn(dependencies.namespaceService, 'sendEventToBoard')
        .mockImplementation(jest.fn());

      const card = await createCard();

      const payload = { content: 'updated-card-content' };
      await cardRepository.updateCard(card.id, payload);

      expect(await cardRepository.getCardById(card.id)).toEqual(
        expect.objectContaining(payload),
      );

      expect(sendEventToBoard).toHaveBeenCalledWith(
        board.id,
        expect.objectContaining({
          payload: expect.objectContaining({ id: card.id }),
        }),
      );
    });

    it('will merge groups if the card is being grouped', async () => {
      const parentCard1 = await createCard();
      const childCard1 = await createCard(parentCard1.id);
      const parentCard2 = await createCard();
      const childCard2 = await createCard(parentCard2.id);

      await cardRepository.updateCard(parentCard2.id, {
        parentId: parentCard1.id,
      });

      expect((await reloadCard(childCard1)).parentId).toEqual(parentCard1.id);

      expect((await reloadCard(parentCard2)).parentId).toEqual(parentCard1.id);

      expect((await reloadCard(childCard2)).parentId).toEqual(parentCard1.id);
    });

    it('will move all child cards when parent card is moved between columns', async () => {
      const newColumn = await prisma.column.create({
        data: { title: 'title', order: 0, boardId: board.id },
      });
      const parentCard1 = await createCard();
      const childCard1 = await createCard(parentCard1.id);

      await cardRepository.updateCard(parentCard1.id, {
        columnId: newColumn.id,
      });

      expect((await reloadCard(childCard1)).columnId).toEqual(newColumn.id);

      expect((await reloadCard(parentCard1)).columnId).toEqual(newColumn.id);
    });
  });

  afterEach(async () => {
    await prisma.card.deleteMany();
  });
});
