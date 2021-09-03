import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import {
  Box,
  Flex,
  Grid,
  Heading,
  Icon,
  Spacer,
  Spinner,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import api from '../../api';
import { useDialogs } from '../../dialog-manager';
import styled from 'styled-components';
import { Navigation } from '../../components/Navigation';
import { NavHeight } from '../../theme/sizes';
import Column from '../../components/Column';
import { useBoard } from '../../hooks/boards';
import {
  useColumns,
  useDeleteColumn,
  useUpdateBoard,
} from '../../hooks/columns';
import { useBoardEvents } from '../../hooks/useBoardEvents';
import { Prisma } from '@prisma/client';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
`;

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  flex-wrap: nowrap;
  margin: 0 auto;
  max-width: 100vw;
  overflow-x: scroll;
  padding: 0 2rem;
`;

const Board = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useBoard(id);
  const { columns, columnsLoading } = useColumns(id);
  const { mutateAsync: addColumnAsync } = useUpdateBoard();

  useBoardEvents(id);

  const { openDialog } = useDialogs();

  if (isLoading) return <Spinner />;
  if (!data) return null;

  return (
    <PageWrapper>
      <Navigation board={data} />
      <Wrapper>
        {columns?.map((column) => {
          return <Column column={column} board={data} key={column.id} />;
        })}
      </Wrapper>
    </PageWrapper>
  );
};

export default Board;
