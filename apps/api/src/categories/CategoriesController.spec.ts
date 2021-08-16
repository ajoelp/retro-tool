import { prisma } from '../prismaClient';
import supertest from 'supertest';
import { app } from '../app';
import { CATEGORIES_ROOT, CATEGORIES_SINGULAR } from './CategoriesRouter';
import generatePath from '../utils/generatePath';

describe('CategoriesController', () => {
  const testBoard = {
    title: 'test board',
    Category: {
      create: {
        title: 'Test Category',
      },
    },
  };

  it('get the categories', async () => {
    const board = await prisma.board.create({ data: testBoard });
    // const category = prisma.category.create({ data: { title: "test Category", boardId: board.id } })

    const response = await supertest(app).get('/categories').expect(200);

    expect(response.body).toEqual({
      categories: expect.arrayContaining([
        expect.objectContaining({ title: 'Test Category', boardId: board.id }),
      ]),
    });
  });

  it('creates a category', async () => {
    const testCategory = {
      title: 'testCategory,',
      Board: {
        create: {
          title: 'testBoard',
        },
      },
    };
    const response = await supertest(app)
      .post(CATEGORIES_ROOT)
      .send(testCategory)
      .expect(200);

    expect(response.body.category).toEqual(
      expect.objectContaining({
        boardId: expect.any(String),
        title: 'testCategory,',
      }),
    );
  });

  it('will update a category', async () => {
    const category = await prisma.category.create({
      data: {
        title: 'test category',
        Board: {
          create: {
            title: 'test board',
          },
        },
      },
    });

    const payload = {
      title: 'new category title',
    };

    const response = await supertest(app)
      .patch(generatePath(CATEGORIES_SINGULAR, { id: category.id }))
      .send(payload)
      .expect(200);

    expect(response.body.category).toEqual(expect.objectContaining(payload));
    expect(
      await prisma.category.findFirst({ where: { id: category.id } }),
    ).toEqual(expect.objectContaining(payload));
  });

  it('will delete a category', async () => {
    const category = await prisma.category.create({
      data: {
        title: 'test category',
        Board: {
          create: {
            title: 'test board',
          },
        },
      },
    });

    const response = await supertest(app)
      .delete(generatePath(CATEGORIES_SINGULAR, { id: category.id }))
      .expect(200);

    expect(response.status).toEqual(200);
    expect(
      await prisma.category.findFirst({ where: { id: category.id } }),
    ).toBeFalsy();
  });
});
