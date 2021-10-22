import { Heading } from '@chakra-ui/react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { useAuth, useImporsonate } from '../contexts/AuthProvider';
import styled from 'styled-components';
import queryString from 'query-string';
import { useBoards, useCreateBoard } from '../hooks/boards';
import { useListUsers } from '../hooks/users';
import { Logo } from '../components/Logo';
import { useForm } from 'react-hook-form';
import { TextInput } from '../components/inputs/TextInput';
import { Button } from '../components/Button';
import { ChevronRightIcon } from '@heroicons/react/solid';
import { dateAgo } from '../utils/dates';
import GithubButton from 'react-github-login-button';
import { UserActions } from '../components/UserActions';
import { Spinner } from '../components/Spinner';

const LoginWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const HistoryLink = styled(Link)`
  text-decoration: underline;
  &:hover {
    opacity: 0.7;
  }
`;

const DEFAULT_COLUMNS = 'Mad, Glad, Sad';

function useQueryParams() {
  return queryString.parse(useLocation().search);
}

const AdminUsersList = () => {
  const { users, usersLoading } = useListUsers();
  const { impersonate, impersonateLoading } = useImporsonate();
  const { user: currentUser, logout } = useAuth();

  if (usersLoading) {
    return (
      <div className="flex justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900 tracking-tight sm:text-3xl mb-4">
        All Users
      </h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {users?.map((user) =>
            user.id === currentUser?.id ? null : (
              <li key={user.id}>
                <div className="block hover:bg-gray-50">
                  <div className="px-2 py-2 flex items-center sm:px-6">
                    <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                      <div className="truncate">
                        <div className="flex text-sm items-center">
                          <p className="font-medium text-indigo-600 truncate">
                            {user.githubNickname}
                          </p>
                          <p className="text-sm text-gray-500 ml-2">
                            {(user as any)._count.boardAccesses} Boards
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-5 flex-shrink-0">
                      <Button
                        size="sm"
                        onClick={() => impersonate({ userId: user.id })}
                      >
                        Impersonate
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            ),
          )}
        </ul>
      </div>
    </div>
  );
};

type FormData = {
  boardName?: string;
  columns?: string;
};

export const CreateBoardForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      columns: 'Mad, Glad, Sad',
    },
  });
  const { createBoard, createBoardLoading } = useCreateBoard();
  const history = useHistory();

  const submit = async (data: FormData) => {
    const {
      data: { board },
    } = await createBoard({
      title: data.boardName?.trim() ?? '',
      columns: data.columns
        ?.split(',')
        .map((value) => value.trim()) as string[],
    });
    history.push(`/boards/${board.id}`);
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
        Create a new Board
      </h2>
      <TextInput
        className="mt-4"
        label="Board Name"
        errors={errors.boardName?.message}
        {...register('boardName', { required: 'Board name is required.' })}
      />
      <TextInput
        className="mt-2"
        label="Columns"
        hint="Comma separated"
        placeholder="Mad, Glad, Sad"
        errors={errors.columns?.message}
        {...register('columns', { required: 'Columns are required.' })}
      />
      <Button type="submit" className="mt-4" isLoading={createBoardLoading}>
        Create
      </Button>
    </form>
  );
};

const UserBoards = () => {
  const { data, isLoading } = useBoards();

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 tracking-tight sm:text-3xl mb-4">
        Recent Boards
      </h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {data?.map((board) => (
            <li key={board.id}>
              <Link
                to={`/boards/${board.id}`}
                className="block hover:bg-gray-50"
              >
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div className="truncate">
                      <div className="flex text-sm">
                        <p className="font-medium text-indigo-600 truncate">
                          {board.title}
                        </p>
                      </div>
                      <div className="mt-2 flex">
                        <div className="flex items-center text-sm text-gray-500">
                          <p>
                            Created{' '}
                            <time dateTime={board.createdAt as any}>
                              {dateAgo(board.createdAt as any)} ago
                            </time>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                      <div className="flex overflow-hidden -space-x-1">
                        {board.boardAccesses.map((applicant) => (
                          <img
                            key={applicant.user.email}
                            className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                            src={applicant.user.avatar}
                            alt={applicant.user.githubNickname}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="ml-5 flex-shrink-0">
                    <ChevronRightIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

const Landing = () => {
  const { user, login } = useAuth();
  const { redirect } = useQueryParams();

  if (!user) {
    return (
      <LoginWrapper>
        <Heading size="md" mb="4">
          Please login.
        </Heading>
        <GithubButton onClick={() => login(redirect as string)}>
          Login
        </GithubButton>
      </LoginWrapper>
    );
  }

  return (
    <div className="grid grid-cols-2">
      <div className="p-4 flex h-screen items-center justify-center sticky top-0">
        <div className="w-full max-w-md">
          <Logo className="mb-8 w-full" style={{ maxWidth: 250 }} />
          <CreateBoardForm />
        </div>
      </div>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8 relative">
        <UserActions className="fixed top-0 right-0 mt-4 mr-4" />
        <div className="w-full max-w-md">
          <UserBoards />
          {user.isAdmin && <AdminUsersList />}
        </div>
      </div>
    </div>
  );
};

/*
const LandingOld = () => {
  const boardTitleRef = useRef<HTMLInputElement>(null);
  const columnNamesRef = useRef<HTMLInputElement>(null);
  const { mutateAsync } = useCreateBoard();
  const { redirect } = useQueryParams();
  const { user, login } = useAuth();
  const { data } = useBoards();

  const history = useHistory();

  const onSubmit = async () => {
    const boardTitle = boardTitleRef.current?.value.trim();
    const columnNames = columnNamesRef.current?.value
      .split(',')
      .map((value) => value.trim());

    if (boardTitle == null || columnNames == null) {
      return;
    }

    // Max length
    if (boardTitle.length > 255) {
      return;
    }

    // Needs two columns
    if (columnNames.length < 2) {
      return;
    }

    const {
      data: { board },
    } = await mutateAsync({
      title: boardTitle,
      columns: columnNames,
      userId: 'asdasd',
    });
    history.push(`/boards/${board.id}`);
  };

  if (!user) {
    return (
      <LoginWrapper>
        <Heading size="md" mb="4">
          Please login.
        </Heading>
        <GithubButton onClick={() => login(redirect as string)}>
          Login
        </GithubButton>
      </LoginWrapper>
    );
  }

  return (
    <>
      <Heading textAlign="center" my="10">
        Create a board
      </Heading>
      <Box
        maxW="md"
        borderRadius="lg"
        marginX="auto"
        marginY="10"
        borderWidth="1px"
        borderStyle="solid"
        borderColor="gray.200"
        p="5"
      >
        <FormControl id="boardTitle" isRequired mb="3">
          <FormLabel>Board Title</FormLabel>
          <Input
            placeholder="Board title"
            data-testid="board_title"
            ref={boardTitleRef}
          />
        </FormControl>
        <FormControl id="columnName" isRequired mb="3">
          <FormLabel>Column Names</FormLabel>
          <Input
            data-testid="column_names"
            placeholder={DEFAULT_COLUMNS}
            defaultValue={DEFAULT_COLUMNS}
            ref={columnNamesRef}
          />
          <FormHelperText>Comma separated</FormHelperText>
        </FormControl>

        <Button data-testid="create_board_button" onClick={onSubmit}>
          Create board
        </Button>
      </Box>
      <Heading textAlign="center" my="10">
        Previous Boards
      </Heading>
      <Box maxW="md" borderRadius="lg" marginX="auto" marginY="10" p="5">
        {data &&
          data.map((board) => (
            <div>
              <HistoryLink to={`/boards/${board.id}`}>
                {board.title} ({dateAgo(board.createdAt as any)} ago)
              </HistoryLink>
            </div>
          ))}
      </Box>
      {user.isAdmin && <AdminUsersList />}
    </>
  );
};
*/

export default Landing;
