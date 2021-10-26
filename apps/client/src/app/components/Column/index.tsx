import { Board, Column as ColumnType } from '@prisma/client';
import {
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
  Droppable,
  DroppableProvided,
  DroppableStateSnapshot,
} from 'react-beautiful-dnd';
import { useBoard } from '../../hooks/boards';
import { useDialogs } from '../../dialog-manager';
import { useDeleteColumn } from '../../hooks/columns';
import { DeleteIcon } from '@chakra-ui/icons';
import { useCards, useCreateCard } from '../../hooks/cards';
import { KeyboardEvent, useEffect, useMemo, useRef } from 'react';
import { Card } from '../Card';
import { CardType } from '@retro-tool/api-interfaces';
import { eventEmitter } from '../../utils/EventEmitter';
import { useBoardState } from '../../contexts/BoardProvider';
import { classNames } from '../../utils/classNames';

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

const containerClasses = (isDragging: boolean) => {
  return classNames(
    'h-full rounded flex flex-col p-2 items-start overflow-y-scroll',
    isDragging
      ? 'bg-gray-200 dark:bg-gray-600'
      : 'bg-gray-100 dark:bg-gray-700 border dark:border-transparent',
  );
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
        <div
          className={containerClasses(dropSnapshot.isDraggingOver)}
          ref={(ref: any) => {
            dropProvided.innerRef(ref);
            cardsContainerRef.current = ref;
          }}
          data-testid={name}
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
        </div>
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
  const { isBoardOwner } = useBoardState();

  const filteredCards = useMemo(() => {
    return cards?.filter((card) => card.parentId == null) ?? [];
  }, [cards]);

  const submitCard = async (event: any) => {
    event.preventDefault();
    if (!newCardRef.current || !newCardRef.current.value?.length) return;

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
      onCancel: () => {},
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
        <div
          className="grid gap-2 overflow-hidden"
          style={{ gridTemplateRows: `50px minmax(0, 1fr) 200px` }}
        >
          <div
            className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded p-2 px-4"
            {...provided.dragHandleProps}
          >
            <p className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              {column.title}
            </p>
            {isBoardOwner && (
              <button onClick={() => deleteColumn(column.id)}>
                <DeleteIcon />
              </button>
            )}
          </div>
          <div>
            <CardList
              name={`card-list-${index}`}
              listType="CARD"
              listId={column.id}
              cards={filteredCards}
              column={column}
            />
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded border dark:border-transparent focus-within:ring">
            <form onSubmit={submitCard} className="h-full">
              <textarea
                className="outline-none w-full h-full rounded bg-transparent border-none resize-none focus:outline-none"
                ref={newCardRef}
                data-testid={`column-input-${index}`}
                placeholder={inputPlaceholder}
                onKeyPress={onInputKeyPress}
              />
            </form>
          </div>
        </div>
      )}
    </Draggable>
  );
}
