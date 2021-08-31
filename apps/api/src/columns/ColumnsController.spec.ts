import { prisma } from '../prismaClient';
import supertest from 'supertest';
import { app } from '../app';
import { COLUMNS_ROOT, COLUMNS_SINGULAR } from './ColumnsRouter';
import generatePath from '../utils/generatePath';
import { Board } from '@prisma/client';
import { namespaceInstance } from '../sockets';
import {
  COLUMN_CREATED_EVENT_NAME,
  COLUMN_DELETED_EVENT_NAME,
  COLUMN_UPDATED_EVENT_NAME,
} from '../../../../libs/api-interfaces/src/lib/socket-events';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const mockSendEventToBoard = jest
  .spyOn(namespaceInstance, 'sendEventToBoard')
  .mockImplementation(() => {});

describe('ColumnsController', () => {
  let board: Board;
  beforeAll(async () => {
    board = await prisma.board.create({
      data: {
        title: 'test board',
        ownerId: 'ownerId',
      },
    });
  });

  it('will throw an error if no board id is provided', async () => {
    const response = await supertest(app).get(`/columns`);
    expect(response.status).toEqual(500);
  });

  it('get the columns', async () => {
    const column = await prisma.column.create({
      data: {
        title: 'column',
        boardId: board.id,
      },
    });
    const response = await supertest(app)
      .get(`/columns?boardId=${board.id}`)
      .expect(200);
    expect(response.body).toEqual({
      columns: expect.arrayContaining([
        expect.objectContaining({ title: column.title, boardId: board.id }),
      ]),
    });
  });

  it('creates a column', async () => {
    const testColumn = {
      title: 'testColumn',
      boardId: board.id,
    };

    const response = await supertest(app)
      .post(COLUMNS_ROOT)
      .send(testColumn)
      .expect(200);

    expect(response.body.column).toEqual(
      expect.objectContaining({
        boardId: expect.any(String),
        title: 'testColumn',
      }),
    );

    expect(mockSendEventToBoard).toHaveBeenCalledWith(board.id, {
      type: COLUMN_CREATED_EVENT_NAME,
      payload: expect.objectContaining(testColumn),
    });
  });

  it('will update a column', async () => {
    const column = await prisma.column.create({
      data: {
        title: 'test column',
        boardId: board.id,
      },
    });

    const payload = {
      title: 'new column title',
    };

    const response = await supertest(app)
      .patch(generatePath(COLUMNS_SINGULAR, { id: column.id }))
      .send(payload)
      .expect(200);

    expect(response.body.column).toEqual(expect.objectContaining(payload));
    expect(await prisma.column.findFirst({ where: { id: column.id } })).toEqual(
      expect.objectContaining(payload),
    );

    expect(mockSendEventToBoard).toHaveBeenCalledWith(board.id, {
      type: COLUMN_UPDATED_EVENT_NAME,
      payload: expect.objectContaining(payload),
    });
  });

  it('will delete a column', async () => {
    const column = await prisma.column.create({
      data: {
        title: 'test column',
        boardId: board.id,
      },
    });

    const response = await supertest(app)
      .delete(generatePath(COLUMNS_SINGULAR, { id: column.id }))
      .expect(200);

    expect(response.status).toEqual(200);
    expect(
      await prisma.column.findFirst({ where: { id: column.id } }),
    ).toBeFalsy();

    expect(mockSendEventToBoard).toHaveBeenCalledWith(board.id, {
      type: COLUMN_DELETED_EVENT_NAME,
      payload: expect.objectContaining(column),
    });
  });
});
