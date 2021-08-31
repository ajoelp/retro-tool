import { Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { namespaceInstance } from '../sockets';
import {
  BOARD_UPDATED_EVENT_NAME,
  COLUMN_CREATED_EVENT_NAME,
  COLUMN_DELETED_EVENT_NAME,
  COLUMN_UPDATED_EVENT_NAME,
} from '@retro-tool/api-interfaces';
import { Prisma } from '@prisma/client';

export class ColumnsController {
  async index(req: Request, res: Response) {
    const { boardId } = req.query;

    if (!boardId) throw new Error('No board id provided');

    const columns = await prisma.column.findMany({
      where: { boardId: boardId as string },
    });
    return res.json({ columns });
  }

  async create(req: Request, res: Response) {
    const column = await prisma.column.create({
      data: req.body,
      include: {
        board: true,
      },
    });

    const board = await prisma.board.update({
      where: { id: column.board.id },
      data: {
        columnOrder: [
          ...(column.board.columnOrder as Prisma.JsonArray),
          column.id,
        ] as Prisma.JsonArray,
      },
    });

    namespaceInstance.sendEventToBoard(column.boardId, {
      type: BOARD_UPDATED_EVENT_NAME,
      payload: board,
    });

    namespaceInstance.sendEventToBoard(column.boardId, {
      type: COLUMN_CREATED_EVENT_NAME,
      payload: column,
    });

    return res.json({ column });
  }

  async update(req: Request, res: Response) {
    const column = await prisma.column.update({
      where: { id: req.params.id },
      data: req.body,
    });

    namespaceInstance.sendEventToBoard(column.boardId, {
      type: COLUMN_UPDATED_EVENT_NAME,
      payload: column,
    });

    return res.json({ column });
  }

  async destroy(req: Request, res: Response) {
    const column = await prisma.column.delete({
      where: { id: req.params.id },
      include: { board: true },
    });

    const board = await prisma.board.update({
      where: { id: column.board.id },
      data: {
        columnOrder: (column.board.columnOrder as Prisma.JsonArray).filter(
          (columnId) => columnId !== column.id,
        ),
      },
    });

    namespaceInstance.sendEventToBoard(column.boardId, {
      type: BOARD_UPDATED_EVENT_NAME,
      payload: board,
    });

    namespaceInstance.sendEventToBoard(column.boardId, {
      type: COLUMN_DELETED_EVENT_NAME,
      payload: column,
    });

    return res.json({});
  }
}
