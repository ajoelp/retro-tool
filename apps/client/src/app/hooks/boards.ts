import { Board } from '.prisma/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient, BoardWithColumn } from '../api';
import { User } from '@prisma/client';
import { PausedState, StartState } from '@retro-tool/api-interfaces';

export const useBoard = (id?: string) => {
  return useQuery(
    ['board', id],
    async () => {
      const { data } = await apiClient.get(`/boards/${id}`);
      return data.board as BoardWithColumn;
    },
    {
      enabled: id != null,
      retry: false
    },
  );
};

type CreateBoardArgs = {
  title: string;
  columns: string[];
  settings?: {
    sortBy: 'createdAt' | 'votes'
  }
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

export const useUpdateBoard = (id?: string) => {
  const { mutateAsync, isLoading } = useMutation((data: Partial<CreateBoardArgs>) =>
    apiClient.patch(`/boards/${id}`, data),
  );
  return {
    updateBoard: mutateAsync,
    updateBoardLoading: isLoading,
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

type startTimerArgs = {
  timer: StartState | PausedState;
};

export const useStartTimer = (boardId: string) => {
  const { mutateAsync, isLoading } = useMutation((params: startTimerArgs) =>
    apiClient.post(`/boards/${boardId}/timers`, params),
  );
  return {
    setTimerState: mutateAsync,
    createBoardLoading: isLoading,
  };
};

type DeleteBoardArgs = {
  boardId: string;
};
export const useDeleteBoard = () => {
  const { mutateAsync, isLoading } = useMutation((params: DeleteBoardArgs) => {
    return apiClient.delete(`/boards/${params.boardId}`);
  });
  return {
    deleteBoard: mutateAsync,
    deleteBoardLoading: isLoading,
  };
};
