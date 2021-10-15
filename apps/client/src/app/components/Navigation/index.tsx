import { Avatar, AvatarGroup } from '@chakra-ui/avatar';
import { AddIcon } from '@chakra-ui/icons';
import { Button, Tooltip, useColorMode } from '@chakra-ui/react';
import { Board } from '@prisma/client';
import { useEffect } from 'react';
import styled from 'styled-components';
import { useBoardState } from '../../contexts/BoardProvider';
import { useDialogs } from '../../dialog-manager';
import { useAddColumn } from '../../hooks/columns';
import { useActiveUsers } from '../../hooks/users';
import { ContainerWidth, NavHeight } from '../../theme/sizes';

const NavigationWrapper = styled.div`
  margin: 1rem auto;
  width: 100%;
  max-width: ${ContainerWidth}px;
  height: ${NavHeight}px;
  display: flex;
  align-items: center;
  flex: 0 auto;
`;

const BoardTitleInput = styled.p`
  height: ${NavHeight}px;
  font-size: 2rem;
  font-weight: bold;
`;

const AddColumnButton = styled.button`
  padding: 10px 20px;
`;

const AvatarContainer = styled.div`
  margin-left: auto;
`;

type NavigationProps = {
  board: Board;
};

export function Navigation({ board }: NavigationProps) {
  const { mutateAsync: addColumnAsync } = useAddColumn(board.id);
  const { openDialog } = useDialogs();
  const activeUsers = useActiveUsers(board.id);
  const { isBoardOwner } = useBoardState();
  const { colorMode, toggleColorMode } = useColorMode()

  useEffect(() => {
    if (
      window.localStorage.getItem(`board-info-shown-${board.id}`) !== 'true' &&
      isBoardOwner
    ) {
      openDialog('boardInfo', { board });
    }
  }, [board, isBoardOwner, openDialog]);

  const addColumn = async () => {
    openDialog('addColumn', {
      onSuccess: async (title) => {
        await addColumnAsync({ title });
      },
    });
  };

  return (
    <NavigationWrapper>
      <div>
        <BoardTitleInput>{board.title}</BoardTitleInput>
      </div>
      <AvatarContainer>
        <AvatarGroup max={5}>
          {activeUsers?.map((user) => (
            <Tooltip label={user.githubNickname} key={user.id}>
              <Avatar size="xs" bor src={user.avatar} />
            </Tooltip>
          ))}
        </AvatarGroup>
      </AvatarContainer>
      <Button
        size="xs"
        ml="2"
        onClick={toggleColorMode}
      >
        Toggle {colorMode === "light" ? "Dark" : "Light"}
      </Button>
      {isBoardOwner && (
        <>
          <Button
            size="xs"
            ml="2"
            onClick={() => openDialog('boardInfo', { board })}
          >
            Invite
          </Button>
          <Button
            size="xs"
            ml="2"
            onClick={() => openDialog('boardExport', { board })}
          >
            Export
          </Button>
        </>
      )}
      <AddColumnButton onClick={addColumn}>
        <AddIcon />
      </AddColumnButton>
    </NavigationWrapper>
  );
}
