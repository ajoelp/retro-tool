import supertest from 'supertest';
import { app } from '../app';
import { BOARDS_ROOT, BOARDS_SINGULAR } from './BoardsRouter';
import { prisma } from '../prismaClient';
import generatePath from '../utils/generatePath';
import { namespaceInstance } from '../sockets';
import { BOARD_UPDATED_EVENT_NAME } from '../../../../libs/api-interfaces/src/lib/socket-events';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const mockSendEventToBoard = jest
  .spyOn(namespaceInstance, 'sendEventToBoard')
  .mockImplementation(() => {});

describe('BoardsController', () => {
  const testBoard = {
    title: 'test board',
    columns: ['col1', 'col2'],
    ownerId: 'ownerId',
  };

  it('fetches a board', async () => {
    const board = await prisma.board.create({
      data: { title: 'testTitle', ownerId: 'ownerId' },
    });

    const response = await supertest(app).get(`/boards/${board.id}`);

    expect(response.status).toEqual(200);
    expect(response.body.board).toEqual(
      expect.objectContaining({
        id: board.id,
      }),
    );
  });

  it('lists the boards', async () => {
    const board = await prisma.board.create({
      data: { title: 'testTitle', ownerId: 'ownerId' },
    });
    const response = await supertest(app).get(BOARDS_ROOT).expect(200);
    expect(response.body).toEqual({
      boards: expect.arrayContaining([
        expect.objectContaining({ id: board.id }),
      ]),
    });
  });

  it('creates a board', async () => {
    const response = await supertest(app)
      .post(BOARDS_ROOT)
      .send(testBoard)
      .expect(200);

    expect(response.body.board).toEqual(
      expect.objectContaining({ title: 'test board' }),
    );
  });

  it('updates a board', async () => {
    const board = await prisma.board.create({
      data: {
        title: 'Random Name',
        ownerId: 'testOwnerId',
      },
    });

    const newTitle = { title: 'Name Random' };

    const response = await supertest(app)
      .patch(generatePath(BOARDS_SINGULAR, { id: board.id }))
      .send(newTitle);

    expect(response.body.board).toEqual(expect.objectContaining(newTitle));
    expect(await prisma.board.findFirst({ where: { id: board.id } })).toEqual(
      expect.objectContaining(newTitle),
    );
    expect(mockSendEventToBoard).toHaveBeenCalledWith(board.id, {
      type: BOARD_UPDATED_EVENT_NAME,
      payload: expect.objectContaining(newTitle),
    });
  });

  it('deletes a board', async () => {
    const board = await prisma.board.create({
      data: {
        title: 'Random Name',
        ownerId: 'testOwnerId',
      },
    });

    const response = await supertest(app).delete(
      generatePath(BOARDS_SINGULAR, { id: board.id }),
    );
    expect(response.status).toEqual(200);
    expect(
      await prisma.board.findFirst({ where: { id: board.id } }),
    ).toBeFalsy();
  });

  afterEach(async () => {
    await prisma.column.deleteMany();
    await prisma.board.deleteMany();
  });
});
