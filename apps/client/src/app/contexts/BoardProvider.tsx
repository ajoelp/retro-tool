import { createContext, ReactNode, useContext, useMemo } from 'react';
import { BoardWithColumn } from '../api';
import { useBoard } from '../hooks/boards';
import { useAuth } from './AuthProvider';

type BoardProviderState = {
  board: BoardWithColumn | null | undefined;
  isBoardOwner: boolean;
};

const BoardContext = createContext<BoardProviderState>({
  board: null,
  isBoardOwner: false,
});

export const BoardProvider = ({
  children,
  boardId,
}: {
  children: ReactNode;
  boardId: string;
}) => {
  const { data } = useBoard(boardId);
  const { user } = useAuth();

  const state = useMemo(
    () => ({
      board: data,
      isBoardOwner: data?.ownerId === user?.id,
    }),
    [data, user?.id],
  );

  return (
    <BoardContext.Provider value={state}>{children}</BoardContext.Provider>
  );
};

export const useBoardState = () => {
  return useContext(BoardContext);
};
