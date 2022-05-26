import {
  ACTION_ITEM_CREATED_EVENT_NAME,
  ACTION_ITEM_DELETED_EVENT_NAME,
  ACTION_ITEM_UPDATED_EVENT_NAME,
} from '@retro-tool/api-interfaces';
import { Response } from 'express';
import dependencies from '../dependencies';
import { prisma } from '../prismaClient';
import { ApiRequest } from '../types/ApiRequest';

export class ActionItemController {
  async index(req: ApiRequest, res: Response) {
    const { boardId } = req.params;
    const actionItems = await prisma.actionItem.findMany({
      where: { boardId },
      orderBy: { createdAt: 'asc' },
    });
    return res.json({ actionItems });
  }

  async create(req: ApiRequest, res: Response) {
    const { boardId } = req.params;
    const { value } = req.body;

    const actionItem = await prisma.actionItem.create({
      data: {
        value,
        boardId,
        complete: false,
      },
    });

    dependencies.namespaceService.sendEventToBoard(boardId, {
      type: ACTION_ITEM_CREATED_EVENT_NAME,
      payload: actionItem,
    });

    return res.json({ actionItem });
  }

  async update(req: ApiRequest, res: Response) {
    const { boardId, id } = req.params;
    const { value, complete } = req.body;

    const actionItem = await prisma.actionItem.update({
      where: { id },
      data: {
        value,
        complete,
      },
    });

    dependencies.namespaceService.sendEventToBoard(boardId, {
      type: ACTION_ITEM_UPDATED_EVENT_NAME,
      payload: actionItem,
    });

    return res.json({ actionItem });
  }

  async destroy(req: ApiRequest, res: Response) {
    const { boardId, id } = req.params;

    const actionItem = await prisma.actionItem.delete({ where: { id } });

    dependencies.namespaceService.sendEventToBoard(boardId, {
      type: ACTION_ITEM_DELETED_EVENT_NAME,
      payload: actionItem,
    });

    return res.json({ actionItem });
  }

  async import(req: ApiRequest, res: Response) {
    const { boardId } = req.params;
    const { sourceBoardId } = req.body;

    const actionItems = await prisma.actionItem.findMany({
      where: { boardId: sourceBoardId, NOT: { complete: true } },
    });

    const items = await prisma.$transaction(
      actionItems.map(({ id, ...item }) => {
        return prisma.actionItem.create({ data: { ...item, boardId } });
      }),
    );

    items.forEach((actionItem) => {
      dependencies.namespaceService.sendEventToBoard(boardId, {
        type: ACTION_ITEM_CREATED_EVENT_NAME,
        payload: actionItem,
      });
    });

    return res.json({ actionItems: items });
  }
}
