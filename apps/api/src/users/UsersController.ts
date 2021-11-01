import { ApiRequest } from '../types/ApiRequest';
import { prisma } from '../prismaClient';
import { Response } from 'express';

export class UsersController {
  async index(req: ApiRequest, res: Response) {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { boardAccesses: true },
        },
      },
    });

    return res.json({ users });
  }
}
