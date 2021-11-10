import { Alert, AlertIcon, AlertTitle, Spinner } from '@chakra-ui/react';
import { Column as ColumnType } from '@prisma/client';
import { useEffect, useState } from 'react';
import {
  DragDropContext,
  DraggableLocation,
  Droppable,
  DroppableProvided,
  DropResult,
} from 'react-beautiful-dnd';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useBoard } from '../../hooks/boards';
import { useColumns, useReorderColumn } from '../../hooks/columns';
import { useBoardEvents } from '../../hooks/useBoardEvents';
import { useUpdateCard } from '../../hooks/cards';
import { ColumnWidth, NavHeight } from '../../theme/sizes';
import { BoardProvider } from '../../contexts/BoardProvider';
import { Helmet } from 'react-helmet';
import { Navigation } from '../../components/Navigation';
import Column from '../../components/Column';

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  flex-wrap: nowrap;
  margin: 0 auto;
  height: calc(100vh - ${NavHeight}px - 60px);
  padding: 0 2rem;
`;

const order = (columns: ColumnType[]) =>
  columns.sort((a, b) => a.order - b.order);

const reorder = (
  list: ColumnType[] = [],
  startIndex: number,
  endIndex: number,
): ColumnType[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const Board = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useBoard(id);
  const { columns: apiColumns, columnsLoading } = useColumns(id);
  const { mutateAsync: reorderColumnAsync } = useReorderColumn(data?.id);
  const [columns, setColumns] = useState(order(apiColumns ?? []));
  const { updateCard } = useUpdateCard();

  useEffect(() => {
    setColumns(order(apiColumns ?? []));
  }, [apiColumns]);

  useBoardEvents(id);

  if (isError) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle mr={2}>Unauthorized.</AlertTitle>
      </Alert>
    );
  }
  if (isLoading || columnsLoading) return <Spinner />;
  if (!data) return null;

  const onDragEnd = async (result: DropResult) => {
    if (result.combine) {
      if (result.type === 'CARD') {
        const cardTook = result.draggableId;
        const cardCombined = result.combine.draggableId;
        await updateCard({
          cardId: cardTook,
          payload: { parentId: cardCombined },
        });
      }
      return;
    }

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

    // moving to a different column

    if (result.type === 'CARD') {
      if (result.source.droppableId !== result.destination.droppableId) {
        await updateCard({
          cardId: result.draggableId,
          payload: {
            columnId: result.destination.droppableId,
          },
        });
      }
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

      // make request here
      await reorderColumnAsync({
        sourceIndex: source.index,
        destinationIndex: destination.index,
      });

      return;
    }
  };
  return (
    <BoardProvider boardId={data.id}>
      <Helmet>
        <title>Retro - {data.title}</title>
      </Helmet>
      <div
        className="h-screen w-full grid bg-white text-gray-800 dark:bg-gray-800 dark:text-white gap-2"
        style={{ gridTemplateRows: `${NavHeight}px 1fr` }}
      >
        <Navigation />
        <div className="overflow-x-scroll scrollbar scrollbar-thin scrollbar-thumb-gray-900 flex">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="board" type="COLUMN" direction="horizontal">
              {(provided: DroppableProvided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="inline-grid p-2 gap-4 mx-auto h-full"
                  style={{
                    gridTemplateColumns: `repeat(auto-fill,minmax(${ColumnWidth}px,1fr))`,
                    gridAutoFlow: 'column',
                    gridAutoColumns: `minmax(${ColumnWidth}px, 1fr)`,
                  }}
                >
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
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    </BoardProvider>
  );
  // return (
  //   <BoardProvider boardId={data.id}>
  //     <div className="flex flex-col h-screen min-w-screen overflow-x-scroll bg-white dark:bg-gray-800 text-gray-800 dark:text-white">

  //       <Navigation board={data} />
  //     </div>
  //   </BoardProvider>
  // );
};

export default Board;
