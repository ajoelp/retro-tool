import { Board } from '.prisma/client';
import { useMutation, useQuery } from 'react-query';
import { apiClient, BoardWithColumn } from '../api';
import { User } from '@prisma/client';

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
};

export const useCreateBoard = () => {
  const { mutateAsync, isLoading } = useMutation((params: CreateBoardArgs) =>
    apiClient.post('/boards', params),
  );
  return {
    createBoard: mutateAsync,
    createBoardLoading: isLoading,
  };
};

type BoardWithAccesses = Board & {
  boardAccesses: {
    user: User;
  }[];
};

export const useBoards = () => {
  return useQuery<BoardWithAccesses[]>(['boards'], async () => {
    const { data } = await apiClient.get('/boards');

    return data.boards;
  });
};
