import { Request, Response } from 'express';
import { prisma } from '../prismaClient';

export class BoardsController {
  async index(req: Request, res: Response) {
    const boards = await prisma.board.findMany();
    return res.json({ boards });
  }

  async create(req: Request, res: Response) {
    const board = await prisma.board.create({
      data: req.body,
    });
    return res.json({ board });
  }

  async update(req: Request, res: Response) {
    const board = await prisma.board.update({
      where: { id: req.params.id },
      data: req.body,
    });

    return res.json({ board });
  }

  async destroy(req: Request, res: Response) {
    await prisma.board.delete({
      where: { id: req.params.id },
    });
    return res.json({});
  }
}
