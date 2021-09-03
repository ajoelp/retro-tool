import { ReactNode } from 'react';
import styled from 'styled-components';
import { white } from '../../theme/colors';
import { ContainerWidth, NavHeight } from '../../theme/sizes';
import { Board } from '@prisma/client';
import { AddIcon } from '@chakra-ui/icons';
import { useUpdateBoard } from '../../hooks/columns';
import { useDialogs } from '../../dialog-manager';

const NavigationWrapper = styled.div`
  margin: 1rem auto;
  width: 100%;
  max-width: ${ContainerWidth}px;
  height: ${NavHeight}px;
  display: flex;
  align-items: center;
  flex: 0 auto;
`;

const BoardTitleInput = styled.input`
  height: ${NavHeight}px;
  font-size: 2rem;
  font-weight: bold;
`;

const AddColumnButton = styled.button`
  margin-left: auto;
  padding: 10px 20px;
`;

type NavigationProps = {
  board: Board;
};

export function Navigation({ board }: NavigationProps) {
  const { mutateAsync: addColumnAsync } = useUpdateBoard();
  const { openDialog } = useDialogs();

  const addColumn = async () => {
    openDialog('addColumn', {
      onSuccess: async (title) => {
        await addColumnAsync({ boardId: board.id, title });
      },
    });
  };

  return (
    <NavigationWrapper>
      <BoardTitleInput defaultValue={board.title} />
      <AddColumnButton onClick={addColumn}>
        <AddIcon />
      </AddColumnButton>
    </NavigationWrapper>
  );
}
