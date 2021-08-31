import { ReactNode } from 'react';
import styled from 'styled-components';
import { white } from '../../theme/colors';
import { NavHeight } from '../../theme/sizes';
import { Board } from '@prisma/client';
import { BoardWithColumn } from '../../api';
import { AddIcon } from '@chakra-ui/icons';
import { useBoard } from '../../hooks/boards';
import { useUpdateBoard } from '../../hooks/columns';
import { useDialogs } from '../../dialog-manager';

const NavigationWrapper = styled.div`
  background-color: ${white};
  height: ${NavHeight}px;
  border-bottom: 1px solid #efefef;
  display: flex;
  align-items: center;
`;

const BoardTitleInput = styled.input`
  height: ${NavHeight}px;
  padding: 10px 20px;
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
