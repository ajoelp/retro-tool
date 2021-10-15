import { Board, Column as ColumnType } from '@prisma/client';
import styled, { css } from 'styled-components';
import { Box, Heading, useColorModeValue } from '@chakra-ui/react';
import {
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
  Droppable,
  DroppableProvided,
  DroppableStateSnapshot,
} from 'react-beautiful-dnd';
import { BorderRadius, ColumnWidth, GAP } from '../../theme/sizes';
import { backgroundColor, backgroundColorDarker } from '../../theme/colors';
import { useBoard } from '../../hooks/boards';
import { useDialogs } from '../../dialog-manager';
import { useDeleteColumn } from '../../hooks/columns';
import { DeleteIcon } from '@chakra-ui/icons';
import { useCards, useCreateCard } from '../../hooks/cards';
import { KeyboardEvent, useMemo, useRef } from 'react';
import { Card } from '../Card';
import { RingShadow } from '../../theme/shadows';
import { CardType } from '@retro-tool/api-interfaces';
import { eventEmitter } from '../../utils/EventEmitter';
import { useEffect } from 'react';
import { useBoardState } from '../../contexts/BoardProvider';

const Wrapper = styled.div`
  width: ${ColumnWidth}px;
  margin-right: ${GAP}px;
  padding: 2em 0;
  flex-shrink: 0;
  &:last-child {
    margin-right: 0;
  }
`;

type CardsContainerProps = {
  isDraggingOver: boolean;
  isDraggingFrom: boolean;
};

const CardsContainer = styled(Box) <CardsContainerProps>`
  /* background-color: ${backgroundColor}; */
  /* ${({ isDraggingOver }) =>
    isDraggingOver &&
    css`
      background-color: ${backgroundColorDarker};
    `}; */
  height: 100%;
  margin: 20px 0;
  border-radius: ${BorderRadius}px;
  display: flex;
  flex-direction: column;
  padding: 10px;
  align-items: flex-start;
  overflow-y: scroll;
`;

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;
const AddCardContainer = styled.form`
  margin-top: auto;
  border-radius: ${BorderRadius}px;
  overflow: hidden;
`;

const AddCardInput = styled.textarea`
  width: 100%;
  height: 200px;
  resize: none;
  padding: 10px;
  display: flex;
  background-color: transparent;
  &:focus {
    outline: none;
    border: none;
    box-shadow: ${RingShadow};
    border-radius: ${BorderRadius}px;
  }
`;

const HeadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

type ColumnProps = {
  column: ColumnType;
  board: Board;
  title: string;
  index: number;
};

type CardsListProps = {
  cards: CardType[];
  column: ColumnType;
  listType: string;
  listId: string;
  name: string;
};

export function CardList({
  cards,
  column,
  listType,
  listId,
  name,
}: CardsListProps) {
  const cardsRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const cardsContainerRef = useRef<HTMLDivElement | null>();

  const containerBackgroundColor = useColorModeValue("gray.100", "gray.900")
  const draggingContainerBackgroundColor = useColorModeValue("gray.200", "gray.700")

  useEffect(() => {
    const onFocus = (id: string) => {
      const htmlElement = cardsRefs.current[id];
      const containerElement = cardsContainerRef.current;
      console.log({ htmlElement, containerElement });
      htmlElement?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    };
    eventEmitter.addListener('focus', onFocus);
    return () => {
      eventEmitter.removeListener('focus', onFocus);
    };
  }, []);

  return (
    <Droppable droppableId={listId} type={listType} isCombineEnabled={true}>
      {(
        dropProvided: DroppableProvided,
        dropSnapshot: DroppableStateSnapshot,
      ) => (
        <CardsContainer
          ref={(ref: any) => {
            dropProvided.innerRef(ref);
            cardsContainerRef.current = ref;
          }}
          isDraggingOver={dropSnapshot.isDraggingOver}
          isDraggingFrom={Boolean(dropSnapshot.draggingFromThisWith)}
          data-testid={name}
          backgroundColor={dropSnapshot.isDraggingOver ? draggingContainerBackgroundColor : containerBackgroundColor}
          {...dropProvided.droppableProps}
        >
          {cards?.map((card, index) => (
            <Card
              key={card.id}
              card={card}
              column={column}
              index={index}
              ref={(ref) => {
                cardsRefs.current[card.id] = ref;
              }}
            />
          ))}
          {dropProvided.placeholder}
        </CardsContainer>
      )}
    </Droppable>
  );
}

export default function Column({ column, board, title, index }: ColumnProps) {
  const { mutateAsync: deleteColumnAsync } = useDeleteColumn();
  const { openDialog } = useDialogs();
  const { refetch } = useBoard(board.id);
  const { cards } = useCards(column.id);
  const { createCard } = useCreateCard(column.id);
  const newCardRef = useRef<HTMLTextAreaElement>(null);
  const { isBoardOwner } = useBoardState()
  const containerBackgroundColor = useColorModeValue("gray.100", "gray.900")

  const filteredCards = useMemo(() => {
    return cards?.filter((card) => card.parentId == null) ?? [];
  }, [cards]);

  const submitCard = async (event: any) => {
    event.preventDefault();
    if (!newCardRef.current) return;

    await createCard({
      content: newCardRef.current.value ?? '',
    });

    newCardRef.current.value = '';
  };

  const deleteColumn = async (columnId: string) => {
    openDialog('confirmation', {
      title: 'Are you sure?',
      message: 'Are you sure you want to delete the column?',
      onSuccess: async () => {
        await deleteColumnAsync({ columnId });
        await refetch();
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onCancel: () => { },
    });
  };

  const onInputKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!e.shiftKey && e.code === 'Enter') {
      e.preventDefault();
      submitCard(e);
      return;
    }
  };

  const inputPlaceholder =
    'Add a new card.\nPress Enter to submit.\nPress Shift + Enter for a new line';

  return (
    <Draggable draggableId={title} index={index} isDragDisabled={!isBoardOwner}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <Wrapper
          ref={provided.innerRef}
          {...provided.draggableProps}
          data-testid={`column-${index}`}
        >
          <HeadingContainer {...provided.dragHandleProps}>
            <Heading size="md">{column.title}</Heading>
            {isBoardOwner && <button onClick={() => deleteColumn(column.id)}>
              <DeleteIcon />
            </button>}
          </HeadingContainer>

          <Container>
            <CardList
              name={`card-list-${index}`}
              listType="CARD"
              listId={column.id}
              cards={filteredCards}
              column={column}
            />
            <AddCardContainer onSubmit={submitCard}>
              <Box backgroundColor={containerBackgroundColor}>
                <AddCardInput
                  ref={newCardRef}
                  data-testid={`column-input-${index}`}
                  placeholder={inputPlaceholder}
                  onKeyPress={onInputKeyPress}
                />
              </Box>
            </AddCardContainer>
          </Container>
        </Wrapper>
      )}
    </Draggable>
  );
}
