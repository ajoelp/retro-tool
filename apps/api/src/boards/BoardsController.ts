import { User } from '@prisma/client';
import { Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { BOARD_UPDATED_EVENT_NAME } from '@retro-tool/api-interfaces';
import dependencies from '../dependencies';
import { v4 as uuid } from 'uuid';
import { BoardRepository } from './BoardRepository';
import { BoardResource } from './BoardResource';
import { ApiRequest } from '../types/ApiRequest';

const boardRepository = new BoardRepository();
const boardResource = new BoardResource();

export class BoardsController {
  async index(req: ApiRequest, res: Response) {
    const boards = await prisma.board.findMany();
    return res.json({ boards });
  }

  async fetch(req: ApiRequest, res: Response) {
    const { id } = req.params;
    const board = await boardRepository.findById(id);
    return res.json({
      board: boardResource.buildResponse(board, req.user as User),
    });
  }

  async create(req: ApiRequest, res: Response) {
    const { title, columns } = req.body;

    const board = await prisma.board.create({
      data: {
        title,
        ownerId: (req.user as User).id,
        inviteCode: uuid(),
        columns: {
          create: columns.map((column, order) => ({
            title: column,
            order,
          })),
        },
        boardAccesses: {
          create: [{ userId: (req.user as User).id }],
        },
      },
      include: { columns: true },
    });

    return res.json({ board });
  }

  async update(req: ApiRequest, res: Response) {
    const board = await prisma.board.update({
      where: { id: req.params.id },
      data: req.body,
    });

    dependencies.namespaceService.sendEventToBoard(board.id, {
      type: BOARD_UPDATED_EVENT_NAME,
      payload: board,
    });

    return res.json({ board });
  }

  async destroy(req: ApiRequest, res: Response) {
    await prisma.board.delete({
      where: { id: req.params.id },
    });
    return res.json({});
  }
}
