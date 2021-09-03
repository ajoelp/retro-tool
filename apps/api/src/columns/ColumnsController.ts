import { Request, Response } from 'express';
import { prisma } from '../prismaClient';
import {
  COLUMN_CREATED_EVENT_NAME,
  COLUMN_DELETED_EVENT_NAME,
  COLUMN_UPDATED_EVENT_NAME,
} from '@retro-tool/api-interfaces';
import { ColumnRepository } from './ColumnRepository';
import dependencies from '../dependencies';

const columnRepository = new ColumnRepository();

export class ColumnsController {
  async index(req: Request, res: Response) {
    const { boardId } = req.query;
    const columns = await prisma.column.findMany({
      where: { boardId: boardId as string },
    });
    return res.json({ columns });
  }

  async create(req: Request, res: Response) {
    const { title, boardId } = req.body;
    const column = await prisma.column.create({
      data: {
        title,
        boardId,
        order: await columnRepository.getNextOrderValue(boardId),
      },
      include: {
        board: true,
      },
    });

    dependencies.namespaceService.sendEventToBoard(column.boardId, {
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

    dependencies.namespaceService.sendEventToBoard(column.boardId, {
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

    await columnRepository.reorderColumns(column.boardId);

    dependencies.namespaceService.sendEventToBoard(column.boardId, {
      type: COLUMN_DELETED_EVENT_NAME,
      payload: column,
    });

    return res.json({});
  }
}
