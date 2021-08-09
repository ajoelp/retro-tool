import supertest from 'supertest'
import { app } from '../src/app'
import { prisma } from '../src/prismaClient'
describe("App tests", () => {
  const testBoard = {
    title: "test board",
    Category: {
      create: {
        title: "Test Category",
      },
    },
  };

  it("get the boards", async () => {
    const response = await supertest(app).get("/boards").expect(200);
    expect(response.body).toEqual({ boards: [] });
  });

  it("creates a board", async () => {
    const response = await supertest(app).post("/board").send(testBoard).expect(200);

    expect(response.body.board).toEqual(expect.objectContaining({ title: "test board" }));
  });

  it("updates a board", async () => {
    const board = await prisma.board.create({
      data: {
        title: "Random Name",
      },
    });

    const newTitle = { title: "Name Random" };

    const response = await supertest(app).patch(`/board/${board.id}`).send(newTitle);

    expect(response.body.board).toEqual(expect.objectContaining(newTitle));
    expect(await prisma.board.findFirst({ where: { id: board.id } })).toEqual(expect.objectContaining(newTitle));
  });

  it("deletes a board", async () => {
    const board = await prisma.board.create({
      data: {
        title: "Random Name",
      },
    });

    const response = await supertest(app).delete(`/board/${board.id}`);
    expect(response.status).toEqual(200);
    expect(await prisma.board.findFirst({ where: { id: board.id } })).toBeFalsy();
  });

  it("get the categories", async () => {
    const board = await prisma.board.create({ data: testBoard });
    // const category = prisma.category.create({ data: { title: "test Category", boardId: board.id } })

    const response = await supertest(app).get("/categories").expect(200);

    expect(response.body).toEqual({
      categories: expect.arrayContaining([expect.objectContaining({ title: "Test Category", boardId: board.id })]),
    });
  });

  it("creates a category", async () => {
    const testCategory = {
      title: "testCategory,",
      Board: {
        create: {
          title: "testBoard",
        },
      },
    };
    const response = await supertest(app).post("/category").send(testCategory).expect(200);

    expect(response.body.category).toEqual(
      expect.objectContaining({
        boardId: expect.any(String),
        title: "testCategory,",
      }),
    );
  });

  it("will update a category", async () => {
    const category = await prisma.category.create({
      data: {
        title: "test category",
        Board: {
          create: {
            title: "test board",
          },
        },
      },
    });

    const payload = {
      title: "new category title",
    };

    const response = await supertest(app).patch(`/category/${category.id}`).send(payload).expect(200);

    expect(response.body.category).toEqual(expect.objectContaining(payload));
    expect(await prisma.category.findFirst({ where: { id: category.id } })).toEqual(expect.objectContaining(payload));
  });

  it("will delete a category", async () => {
    const category = await prisma.category.create({
      data: {
        title: "test category",
        Board: {
          create: {
            title: "test board",
          },
        },
      },
    });

    const response = await supertest(app).delete(`/category/${category.id}`).expect(200);

    expect(response.status).toEqual(200);
    expect(await prisma.category.findFirst({ where: { id: category.id } })).toBeFalsy();
  });
});
