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
import { useDeleteColumn, useSortByVotes } from '../../hooks/columns';
import { useCards, useCreateCard, usePublishCards } from '../../hooks/cards';
import { KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '../Card';
import { CardType } from '@retro-tool/api-interfaces';
import { eventEmitter } from '../../utils/EventEmitter';
import { useBoardState } from '../../contexts/BoardProvider';
import { classNames } from '../../utils/classNames';
import ActionMenu, { ActionMenuItem } from '../ActionMenu';
import orderBy from 'lodash/orderBy';
import { Switch } from '@headlessui/react';
import { Tooltip } from '../Tooltip';

console.log(Switch);

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
    'h-full rounded flex flex-col p-2 items-start overflow-y-scroll scrollbar scrollbar-thin scrollbar-thumb-gray-900',
    isDragging ? 'bg-gray-200 dark:bg-gray-600' : 'bg-gray-100 dark:bg-gray-700 border dark:border-transparent',
  );
};

export function CardList({ cards, column, listType, listId, name }: CardsListProps) {
  const cardsRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const cardsContainerRef = useRef<HTMLDivElement | null>();

  useEffect(() => {
    const onFocus = (id: string) => {
      const htmlElement = cardsRefs.current[id];
      const containerElement = cardsContainerRef.current;
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

  const sortedCards = orderBy(cards, 'createdAt');

  return (
    <Droppable droppableId={listId} type={listType} isCombineEnabled={true}>
      {(dropProvided: DroppableProvided, dropSnapshot: DroppableStateSnapshot) => (
        <div
          className={containerClasses(dropSnapshot.isDraggingOver)}
          ref={(ref: any) => {
            dropProvided.innerRef(ref);
            cardsContainerRef.current = ref;
          }}
          data-testid={name}
          {...dropProvided.droppableProps}
        >
          {sortedCards?.map((card, index) => (
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
  const { mutateAsync: sortColumnByVotesAsync } = useSortByVotes();
  const { openDialog } = useDialogs();
  const { refetch } = useBoard(board.id);
  const { cards } = useCards(column.id);
  const { createCard } = useCreateCard(column.id);
  const newCardRef = useRef<HTMLTextAreaElement>(null);
  const { isBoardOwner } = useBoardState();
  const { publishCards } = usePublishCards(column.id);
  const [draftMode, setDraftMode] = useState(false);

  const filteredCards = useMemo(() => {
    return cards?.filter((card) => card.parentId == null) ?? [];
  }, [cards]);

  const submitCard = async (event: any) => {
    event.preventDefault();
    if (!newCardRef.current || !newCardRef.current.value?.length) return;

    await createCard({
      content: newCardRef.current.value ?? '',
      draft: draftMode,
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

  const sortColumnByVotes = async (columnId: string) => {
    openDialog('confirmation', {
      title: 'Are you sure?',
      message: 'Are you sure you want to sort the column by votes?',
      onSuccess: async () => {
        await sortColumnByVotesAsync({ columnId });
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

  const ActionItems = useMemo<ActionMenuItem[]>(() => {
    return [
      {
        title: 'Sort Column By Votes',
        action: () => sortColumnByVotes(column.id),
      },
      isBoardOwner
        ? {
            title: 'Delete Column',
            action: () => deleteColumn(column.id),
          }
        : null,
    ].filter((a) => a != null) as ActionMenuItem[];
  }, [column.id, deleteColumn, isBoardOwner, sortColumnByVotes]);

  const hasDraftCards = cards?.find((card) => card.draft === true) != null;

  const inputPlaceholder = 'Add a new card.\nPress Enter to submit.\nPress Shift + Enter for a new line';

  return (
    <Draggable draggableId={title} index={index} isDragDisabled={!isBoardOwner}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="grid gap-2 overflow-hidden"
          style={{
            gridTemplateRows: `50px minmax(0, 1fr) 200px`,
            ...provided.draggableProps.style,
          }}
        >
          <div
            className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded p-2 px-4"
            {...provided.dragHandleProps}
          >
            <p className="text-lg leading-6 font-medium text-gray-900 dark:text-white">{column.title}</p>
            <div className="flex items-center">
              {hasDraftCards && (
                <button
                  className="text-sm mr-2 px-2 py-4 hover:underline"
                  onClick={() => {
                    publishCards();
                  }}
                >
                  Publish Cards
                </button>
              )}
              <ActionMenu items={ActionItems} />
            </div>
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
            <div className="p-1 flex justify-end">
              <Tooltip label="Cards will only appear to you until you publish">
                <div className="flex items-center">
                  <span className="text-sm mr-2">Draft mode</span>
                  <Switch
                    checked={draftMode}
                    onChange={setDraftMode}
                    className="flex-shrink-0 group relative rounded-full inline-flex items-center justify-center h-5 w-10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <span className="sr-only">Use setting</span>
                    <span aria-hidden="true" className="pointer-events-none absolute w-full h-full rounded-md" />
                    <span
                      aria-hidden="true"
                      className={classNames(
                        draftMode ? 'bg-indigo-600' : 'bg-gray-200',
                        'pointer-events-none absolute h-4 w-9 mx-auto rounded-full transition-colors ease-in-out duration-200',
                      )}
                    />
                    <span
                      aria-hidden="true"
                      className={classNames(
                        draftMode ? 'translate-x-5' : 'translate-x-0',
                        'pointer-events-none absolute left-0 inline-block h-5 w-5 border border-gray-200 rounded-full bg-white shadow transform ring-0 transition-transform ease-in-out duration-200',
                      )}
                    />
                  </Switch>
                </div>
              </Tooltip>
            </div>
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
