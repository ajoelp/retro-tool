import { AddIcon } from '@chakra-ui/icons';
import styled from 'styled-components';
import { useBoardState } from '../../contexts/BoardProvider';
import { useDialogs } from '../../dialog-manager';
import { useAddColumn } from '../../hooks/columns';
import { useActiveUsers } from '../../hooks/users';
import { ContainerWidth, NavHeight } from '../../theme/sizes';
import { Avatar, AvatarGroup } from '../Avatar';
import { useColorPreferences } from '../../hooks/useDarkMode';
import { MoonIcon, SunIcon } from '@heroicons/react/solid';
import { Button } from '../Button';
import { Tooltip } from '../Tooltip';
import { Timer } from '../Timer';

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

export function Navigation() {
  const { board, isBoardOwner } = useBoardState();
  const { mutateAsync: addColumnAsync } = useAddColumn(board!.id);
  const { openDialog } = useDialogs();
  const activeUsers = useActiveUsers(board!.id);
  const { theme, toggleTheme } = useColorPreferences();

  const DarkModeIcon = theme === 'dark' ? SunIcon : MoonIcon;
  //
  // /** TODO: fix this */
  // useEffect(() => {
  //   if (!board) return;
  //
  //   if (
  //     window.localStorage.getItem(`board-info-shown-${board.id}`) !== 'true' &&
  //     isBoardOwner
  //   ) {
  //     openDialog('boardInfo', { board });
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [board, isBoardOwner]);

  const addColumn = async () => {
    openDialog('addColumn', {
      onSuccess: async (title) => {
        await addColumnAsync({ title });
      },
    });
  };

  if (!board) return null;

  return (
    <NavigationWrapper>
      <div>
        <BoardTitleInput>{board.title}</BoardTitleInput>
      </div>
      <AvatarContainer>
        <AvatarGroup max={5}>
          {activeUsers?.map((user) => (
            <Tooltip label={user.githubNickname} key={user.id}>
              <Avatar size="xs" src={user.avatar} />
            </Tooltip>
          ))}
        </AvatarGroup>
      </AvatarContainer>
      <div className="ml-2">
        <Timer />
      </div>
      <Button size="sm" variant="white" className="ml-2" onClick={toggleTheme}>
        <DarkModeIcon className="w-4 h-4" />
      </Button>
      {isBoardOwner && (
        <>
          <Button
            size="sm"
            variant="white"
            className="ml-2"
            onClick={() => openDialog('boardInfo', { board })}
          >
            Invite
          </Button>
          <Button
            size="sm"
            variant="white"
            className="ml-2"
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
