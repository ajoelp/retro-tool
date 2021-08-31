import { Button, FormControl, FormLabel, Input, Box, Heading, FormHelperText } from '@chakra-ui/react';
import { useRef } from 'react';
import { useMutation } from 'react-query';
import { useHistory } from 'react-router-dom';
import api from '../api';
import { useUser } from '../contexts/UserContext';

const useCreateBoard = () => {
  return useMutation(api.createBoard);
};

const DEFAULT_COLUMNS = "Mad, Glad, Sad"

const Landing = () => {
  const boardTitleRef = useRef<HTMLInputElement>(null);
  const columnNamesRef = useRef<HTMLInputElement>(null);
  const { mutateAsync } = useCreateBoard();
  const { userId } = useUser()

  const history = useHistory()

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

    const { data: { board } } = await mutateAsync({ title: boardTitle, columns: columnNames, userId });
    history.push(`/boards/${board.id}`)
  };

  return (
    <>
    <Heading textAlign="center" my="10">Create a board</Heading>
    <Box maxW="md" borderRadius="lg" marginX="auto" marginY="10" borderWidth="1px" borderStyle="solid" borderColor="gray.200" p="5">
      <FormControl id="boardTitle" isRequired mb="3">
        <FormLabel>Index Title</FormLabel>
        <Input placeholder="Index title" ref={boardTitleRef} />
      </FormControl>
      <FormControl id="columnName" isRequired mb="3">
        <FormLabel>Column Names</FormLabel>
        <Input placeholder={DEFAULT_COLUMNS} defaultValue={DEFAULT_COLUMNS} ref={columnNamesRef} />
        <FormHelperText>Comma separated</FormHelperText>
      </FormControl>

      <Button onClick={onSubmit}>Create Index</Button>
    </Box>
    </>
  );
};

export default Landing;
