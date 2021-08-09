import express, { Express } from 'express';
import {prisma} from './prismaClient'
import cors from 'cors'

const app = express();

const applyMiddleware = (app: Express) => {
  if (process.env.NODE_ENV !== "test") {
    app.use(cors());
  }
  app.use(express.json());
};

applyMiddleware(app);

app.get("/", (req, res) => {
  return res.json({ status: "ok" });
});

app.get("/boards", async (req, res) => {
  const boards = await prisma.board.findMany();
  return res.json({ boards });
});

app.get("/categories", async (req, res) => {
  const categories = await prisma.category.findMany();
  return res.json({ categories });
});

app.post("/board", async (req, res) => {
  const board = await prisma.board.create({
    data: req.body,
  });

  return res.json({ board });
});

app.patch("/board/:id", async (req, res) => {
  const board = await prisma.board.update({
    where: { id: req.params.id },
    data: req.body,
  });

  return res.json({ board });
});

app.delete("/board/:id", async (req, res) => {
  await prisma.board.delete({
    where: { id: req.params.id },
  });
  return res.json({});
});

app.post("/category", async (req, res) => {
  const category = await prisma.category.create({
    data: req.body,
  });

  return res.json({ category });
});

app.patch("/category/:id", async (req, res) => {
  const category = await prisma.category.update({
    where: { id: req.params.id },
    data: req.body,
  });

  return res.json({ category });
});

app.delete("/category/:id", async (req, res) => {
  await prisma.category.delete({
    where: { id: req.params.id },
  });
  return res.json({});
});

export { app }
