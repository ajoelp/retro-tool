import { useIgnoredEvents } from './../contexts/IgnoredEventsContext';
import { reorderColumnArgs } from './../api';
import { useMutation, useQuery } from 'react-query';
import api from '../api';
import { v4 as uuid } from 'uuid';

export const useColumns = (boardId: string) => {
  const { data, isLoading } = useQuery(['columns', boardId], () =>
    api.fetchColumns(boardId),
  );
  return {
    columns: data,
    columnsLoading: isLoading,
  };
};

export const useUpdateBoard = () => {
  return useMutation(api.addColumn);
};

export const useDeleteColumn = () => {
  return useMutation(api.deleteColumn);
};

export const useReorderColumn = () => {
  const { addIgnoreId } = useIgnoredEvents()
  return useMutation((args: Omit<reorderColumnArgs, 'eventTrackingId'>) => {
    const eventTrackingId = uuid()
    addIgnoreId(eventTrackingId)
    return api.redorderColumn({
      ...args,
      eventTrackingId
    })
  });
};
