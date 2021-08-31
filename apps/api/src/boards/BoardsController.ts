import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { namespaceInstance } from '../sockets';
import { BOARD_UPDATED_EVENT_NAME } from '../../../../libs/api-interfaces/src/lib/socket-events';

export class BoardsController {
  async index(req: Request, res: Response) {
    const boards = await prisma.board.findMany();
    return res.json({ boards });
  }

  async fetch(req: Request, res: Response) {
    const { id } = req.params;
    const board = await prisma.board.findFirst({
      where: { id },
      include: {
        columns: true,
      },
    });
    return res.json({ board });
  }

  async create(req: Request, res: Response) {
    const { title, columns, ownerId } = req.body;

    const createdBoard = await prisma.board.create({
      data: {
        title,
        ownerId,
        columns: {
          create: columns.map((column) => ({ title: column })),
        },
      },
      include: { columns: true },
    });

    // Set columns order

    const columnOrder = createdBoard.columns.map(
      (column) => column.id,
    ) as Prisma.JsonArray;

    const board = await prisma.board.update({
      where: { id: createdBoard.id },
      data: { columnOrder },
    });

    return res.json({ board });
  }

  async update(req: Request, res: Response) {
    const board = await prisma.board.update({
      where: { id: req.params.id },
      data: req.body,
    });

    namespaceInstance.sendEventToBoard(board.id, {
      type: BOARD_UPDATED_EVENT_NAME,
      payload: board,
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
