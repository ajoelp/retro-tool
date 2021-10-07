import { createContext, ReactNode, useContext } from 'react';
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
  const state: BoardProviderState = {
    board: data,
    isBoardOwner: data?.ownerId === user?.id,
  };

  return (
    <BoardContext.Provider value={state}>{children}</BoardContext.Provider>
  );
};

export const useBoardState = () => {
  return useContext(BoardContext);
};
