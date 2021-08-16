import { Request, Response } from 'express';
import { prisma } from '../prismaClient';

export class CategoriesController {
  async index(req: Request, res: Response) {
    const categories = await prisma.category.findMany();
    return res.json({ categories });
  }

  async create(req: Request, res: Response) {
    const category = await prisma.category.create({
      data: req.body,
    });

    return res.json({ category });
  }

  async update(req: Request, res: Response) {
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: req.body,
    });

    return res.json({ category });
  }

  async destroy(req: Request, res: Response) {
    await prisma.category.delete({
      where: { id: req.params.id },
    });
    return res.json({});
  }
}
