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
import { useEffect, useState } from 'react';
import {
  DragDropContext,
  Droppable,
  DroppableProvided,
  DropResult,
  DraggableLocation,
} from 'react-beautiful-dnd';
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
import { Column as ColumnType, Prisma } from '@prisma/client';

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

const reorder = (
  list: ColumnType[] = [],
  startIndex: number,
  endIndex: number,
): any[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const Board = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useBoard(id);
  const { columns: apiColumns, columnsLoading } = useColumns(id);
  const { mutateAsync: addColumnAsync } = useUpdateBoard();
  const [columns, setColumns] = useState(apiColumns);

  useEffect(() => setColumns(apiColumns), [apiColumns]);

  useBoardEvents(id);

  const { openDialog } = useDialogs();

  if (isLoading) return <Spinner />;
  if (!data) return null;

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const source: DraggableLocation = result.source;
    const destination: DraggableLocation = result.destination;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // reordering column
    if (result.type === 'COLUMN') {
      const ordered: ColumnType[] = reorder(
        columns,
        source.index,
        destination.index,
      );

      setColumns(ordered);

      return;
    }
  };

  return (
    <PageWrapper>
      <Navigation board={data} />

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board" type="COLUMN" direction="horizontal">
          {(provided: DroppableProvided) => (
            <Wrapper ref={provided.innerRef} {...provided.droppableProps}>
              {columns?.map((column, index) => {
                return (
                  <Column
                    column={column}
                    board={data}
                    key={column.id}
                    title={column.id}
                    index={index}
                  />
                );
              })}
              {provided.placeholder}
            </Wrapper>
          )}
        </Droppable>
      </DragDropContext>
    </PageWrapper>
  );
};

export default Board;
