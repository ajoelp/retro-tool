import { Request, Response } from 'express';
import { prisma } from '../prismaClient';

export class BoardsController {
  async index(req: Request, res: Response) {
    const boards = await prisma.board.findMany();
    return res.json({ boards });
  }

  async fetch(req: Request, res: Response) {
    const { id } = req.params
    const board = await prisma.board.findFirst({ 
      where: { id },
      include: {
        Category: true
      }
    })
    return res.json({ board })
  }

  async create(req: Request, res: Response) {
    const { title, columns } = req.body;

    const board = await prisma.board.create({
      data: { 
        title, 
        Category: {
          create: columns.map((column) => ({title: column}))
        }
      },
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
