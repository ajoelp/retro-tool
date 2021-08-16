import supertest from 'supertest';
import { app } from '../app';
import { BOARDS_ROOT, BOARDS_SINGULAR } from './BoardsRouter';
import { prisma } from '../prismaClient';
import generatePath from '../utils/generatePath';

describe('BoardsController', () => {
  const testBoard = {
    title: 'test board',
    Category: {
      create: {
        title: 'Test Category',
      },
    },
  };

  it('get the boards', async () => {
    const response = await supertest(app).get(BOARDS_ROOT).expect(200);
    expect(response.body).toEqual({ boards: [] });
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
  });

  it('deletes a board', async () => {
    const board = await prisma.board.create({
      data: {
        title: 'Random Name',
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
});
