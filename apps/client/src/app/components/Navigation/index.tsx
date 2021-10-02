import styled from 'styled-components';
import { ContainerWidth, NavHeight } from '../../theme/sizes';
import { Board } from '@prisma/client';
import { AddIcon } from '@chakra-ui/icons';
import { useAddColumn } from '../../hooks/columns';
import { useDialogs } from '../../dialog-manager';
import { useActiveUsers } from '../../hooks/users';
import { Avatar, AvatarGroup } from '@chakra-ui/avatar';
import { Button, Tooltip } from '@chakra-ui/react';
import { useCopyToClipboard, useLocation } from 'react-use';

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
  const location = useLocation();
  const [, copy] = useCopyToClipboard();

  const addColumn = async () => {
    openDialog('addColumn', {
      onSuccess: async (title) => {
        await addColumnAsync({ title });
      },
    });
  };

  const inviteCode = `${location.origin}/invites/${board.inviteCode}`;

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
      <Tooltip title={inviteCode}>
        <Button size="xs" ml="4" onClick={() => copy(inviteCode)}>
          Copy Invite Code
        </Button>
      </Tooltip>
      <AddColumnButton onClick={addColumn}>
        <AddIcon />
      </AddColumnButton>
    </NavigationWrapper>
  );
}
