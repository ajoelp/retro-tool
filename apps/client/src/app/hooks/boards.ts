import { useMutation, useQuery } from 'react-query';
import { apiClient, BoardWithColumn } from '../api';

export const useBoard = (id: string) => {
  return useQuery(
    ['board', id],
    async () => {
      const { data } = await apiClient.get(`/boards/${id}`);
      return data.board as BoardWithColumn;
    },
    {
      enabled: id != null,
    },
  );
};

type CreateBoardArgs = {
  title: string;
  columns: string[];
  userId: string;
};

export const useCreateBoard = () => {
  return useMutation((params: CreateBoardArgs) =>
    apiClient.post('/boards', params),
  );
};
