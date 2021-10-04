import { TestCase } from '../utils/TestCase';
import { prisma } from '../prismaClient';
import { COLUMNS_ROOT, COLUMNS_SINGULAR } from './ColumnsRouter';
import generatePath from '../utils/generatePath';
import { Board, User } from '@prisma/client';

import {
  COLUMN_CREATED_EVENT_NAME,
  COLUMN_DELETED_EVENT_NAME,
  COLUMN_UPDATED_EVENT_NAME,
} from '@retro-tool/api-interfaces';
import dependencies from '../dependencies';

const mockSendEventToBoard = jest
  .spyOn(dependencies.namespaceService, 'sendEventToBoard')
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  .mockImplementation(() => {});

describe('ColumnsController', () => {
  let user: User;
  let board: Board;
  beforeAll(async () => {
    user = await prisma.user.create({
      data: {
        email: 'test@email.com',
        githubNickname: 'testUser',
        avatar: 'test-avatar',
      },
    });
    board = await prisma.board.create({
      data: {
        title: 'test board',
        ownerId: user.id,
      },
    });
  });

  it('will throw an error if no board id is provided', async () => {
    const response = await TestCase.make().actingAs(user).get(`/columns`);
    expect(response.status).toEqual(500);
  });

  it('get the columns', async () => {
    const column = await prisma.column.create({
      data: {
        title: 'column',
        boardId: board.id,
        order: 0,
      },
    });
    const response = await TestCase.make()
      .actingAs(user)
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

    const response = await TestCase.make()
      .actingAs(user)
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
        order: 0,
      },
    });

    const payload = {
      title: 'new column title',
    };

    const response = await TestCase.make()
      .actingAs(user)
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
        order: 0,
      },
    });

    const response = await TestCase.make()
      .actingAs(user)
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

  it('will delete a column with cards', async () => {
    const column = await prisma.column.create({
      data: {
        title: 'title',
        order: 0,
        boardId: board.id,
      },
    });

    const card = await prisma.card.create({
      data: {
        content: '',
        ownerId: user.id,
        columnId: column.id,
        order: 0,
      },
    });

    const response = await TestCase.make()
      .actingAs(user)
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

  it('will reorder columns', async () => {
    const column1 = await prisma.column.create({
      data: {
        title: 'column',
        boardId: board.id,
        order: 0,
      },
    });
    const column2 = await prisma.column.create({
      data: {
        title: 'column',
        boardId: board.id,
        order: 1,
      },
    });
    const column3 = await prisma.column.create({
      data: {
        title: 'column',
        boardId: board.id,
        order: 2,
      },
    });

    const response = await TestCase.make()
      .actingAs(user)
      .post('/columns/reorder')
      .send({
        boardId: board.id,
        sourceIndex: 2,
        destinationIndex: 0,
        eventTrackingId: 'event-tracking-id',
      });

    expect(response.status).toEqual(200);

    expect(
      await prisma.column.findFirst({ where: { id: column1.id } }),
    ).toEqual(expect.objectContaining({ order: 1 }));

    expect(
      await prisma.column.findFirst({ where: { id: column2.id } }),
    ).toEqual(expect.objectContaining({ order: 2 }));

    expect(
      await prisma.column.findFirst({ where: { id: column3.id } }),
    ).toEqual(expect.objectContaining({ order: 0 }));
  });

  afterEach(async () => {
    await prisma.column.deleteMany();
  });
});
