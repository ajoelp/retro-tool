import { prisma } from '../prismaClient';
import { COLUMN_UPDATED_EVENT_NAME } from '@retro-tool/api-interfaces';
import dependencies from '../dependencies';

export class ColumnRepository {
  async getNextOrderValue(boardId: string) {
    const lastColumn = await prisma.column.findFirst({
      where: { boardId },
      orderBy: { order: 'desc' },
    });
    return lastColumn ? lastColumn.order + 1 : 0;
  }

  async reorderColumns(boardId: string) {
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
}
