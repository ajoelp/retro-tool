import { useIgnoredEvents } from '../contexts/IgnoredEventsContext';
import { apiClient } from '../api';
import { useMutation, useQuery } from 'react-query';
import { v4 as uuid } from 'uuid';
import { Column } from '@prisma/client';

export const useColumns = (boardId: string) => {
  const { data, isLoading } = useQuery(['columns', boardId], async () => {
    const { data } = await apiClient.get('/columns', { params: { boardId } });
    return data.columns as Column[];
  });
  return {
    columns: data,
    columnsLoading: isLoading,
  };
};

export type AddColumnParams = {
  title: string;
};
export const useAddColumn = (boardId: string) => {
  return useMutation(async (params: AddColumnParams) => {
    const { data } = await apiClient.post('/columns', {
      boardId,
      ...params,
    });
    return data.column as Column;
  });
};

type DeleteColumnParams = {
  columnId: string;
};

export const useDeleteColumn = () => {
  return useMutation(({ columnId }: DeleteColumnParams) =>
    apiClient.delete(`/columns/${columnId}`),
  );
};

export type ReorderColumnArgs = {
  sourceIndex: number;
  destinationIndex: number;
};

export const useReorderColumn = (boardId?: string) => {
  const { addIgnoreId } = useIgnoredEvents();
  return useMutation((args: ReorderColumnArgs) => {
    const eventTrackingId = uuid();
    addIgnoreId(eventTrackingId);
    return apiClient.post('/columns/reorder', {
      boardId,
      eventTrackingId,
      ...args,
    });
  });
};
