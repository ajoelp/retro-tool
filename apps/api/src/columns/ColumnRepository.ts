import { prisma } from '../prismaClient';
import { COLUMN_UPDATED_EVENT_NAME } from '@retro-tool/api-interfaces';
import dependencies from '../dependencies';
import { Column } from '@prisma/client';

const reorder = (
  columns: Column[],
  startIndex: number,
  endIndex: number,
): any[] => {
  const result = Array.from(columns);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export class ColumnRepository {
  async getNextOrderValue(boardId: string) {
    const lastColumn = await prisma.column.findFirst({
      where: { boardId },
      orderBy: { order: 'desc' },
    });
    return lastColumn ? lastColumn.order + 1 : 0;
  }

  async deleteColumns(boardId: string) {
    const columns = await prisma.column.findMany({
      where: { boardId },
      orderBy: { order: 'asc' },
    });
    for (const [index, column] of columns.entries()) {
      if (column.order !== index) {
        const updatedColumn = await prisma.column.update({
          where: { id: column.id },
          data: { order: index },
        });

        dependencies.namespaceService.sendEventToBoard(boardId, {
          type: COLUMN_UPDATED_EVENT_NAME,
          payload: updatedColumn,
        });
      }
    }
  }

  async reorderColumns(
    boardId: string,
    sourceIndex: number,
    destinationIndex: number,
  ) {
    const columns = await prisma.column.findMany({
      where: { boardId },
      orderBy: { order: 'asc' },
    });

    const ordered: Column[] = reorder(columns, sourceIndex, destinationIndex);

    for (const [index, column] of ordered.entries()) {
      if (column.order !== index) {
        const updatedColumn = await prisma.column.update({
          where: { id: column.id },
          data: { order: index },
        });

        dependencies.namespaceService.sendEventToBoard(boardId, {
          type: COLUMN_UPDATED_EVENT_NAME,
          payload: updatedColumn,
        });
      }
    }
  }
}
