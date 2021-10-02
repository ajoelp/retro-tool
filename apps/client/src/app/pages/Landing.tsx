import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
} from '@chakra-ui/react';
import { useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import GithubButton from 'react-github-login-button';
import { useAuth } from '../contexts/AuthProvider';
import styled from 'styled-components';
import queryString from 'query-string';
import { useCreateBoard } from '../hooks/boards';

const LoginWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const DEFAULT_COLUMNS = 'Mad, Glad, Sad';

function useQueryParams() {
  return queryString.parse(useLocation().search);
}

const Landing = () => {
  const boardTitleRef = useRef<HTMLInputElement>(null);
  const columnNamesRef = useRef<HTMLInputElement>(null);
  const { mutateAsync } = useCreateBoard();
  const { redirect } = useQueryParams();
  const { user, login } = useAuth();

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
    </>
  );
};

export default Landing;
