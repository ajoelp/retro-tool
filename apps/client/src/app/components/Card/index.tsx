import { Column } from '@prisma/client';
import { forwardRef, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthProvider';
import {
  useDeleteCard,
  useFocusCard,
  useUpdateCard,
  useVoteCard,
} from '../../hooks/cards';
import { Spinner } from '@chakra-ui/react';
import { CardType } from '@retro-tool/api-interfaces';
import { primaryColor } from '../../theme/colors';
import {
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
  DraggingStyle,
  NotDraggingStyle,
} from 'react-beautiful-dnd';
import { MenuIcon } from '@heroicons/react/outline';
import { DeleteIcon, ViewIcon } from '@chakra-ui/icons';
import { eventEmitter } from '../../utils/EventEmitter';
import { useBoardState } from '../../contexts/BoardProvider';
import { Avatar } from '../Avatar';
import { classNames } from '../../utils/classNames';
import { AlertBadge } from '../AlertBadge';
import { Tooltip } from '../Tooltip';
import { Textarea } from '../Textarea';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/solid';
import { AnimatePresence, motion } from 'framer-motion';

type CardProps = {
  column: Column;
  card: CardType;
  index: number;
  isClone?: boolean;
};

const CardDetails = styled.div`
  display: flex;
  padding: 0.5rem;
  justify-content: space-between;
  margin-top: auto;
`;

const CardVotesContainer = styled.div`
  display: flex;
  p {
    margin: 0 0.5rem;
  }
`;

const Loader = styled(Spinner)`
  margin-right: 1rem;
`;

const CardVotesButton = styled.button`
  svg {
    height: 1rem;
    width: 1rem;
  }
`;

const HoldBar = styled.div`
  width: 100%;
  height: 5px;
  background-color: ${primaryColor};
`;

const HoldIcon = styled(MenuIcon)`
  width: 20px;
  height: 20px;
  margin: 1rem 0.5rem;
`;

const InputContainer = styled.div`
  display: flex;
`;

const DragWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const IconButton = styled.button`
  margin: 0 0.5rem;
`;

function getStyle(
  style: DraggingStyle | NotDraggingStyle | undefined,
  snapshot: DraggableStateSnapshot,
) {
  if (!snapshot.isDragging) return {};
  if (!snapshot.isDropAnimating) return style;
  return {
    ...style,
    transitionDuration: '-0.001s',
  };
}

type ContainerClassOptions = {
  isDragging: boolean;
  isGroupedOver: boolean;
  hasChildren: boolean;
  highlightCard: boolean;
};

const containerClasses = ({
  isDragging,
  isGroupedOver,
  hasChildren,
  highlightCard,
}: ContainerClassOptions) => {
  return classNames(
    'bg-white dark:bg-gray-800 relative w-full min-h-64 mb-2 flex flex-col rounded z-10 top-0 left-0 focus-within:ring overflow-hidden',
    isDragging && 'opacity-80',
    (isGroupedOver || highlightCard) && 'ring',
  );
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ card, index }, ref) => {
    const [value, setValue] = useState(card?.content);
    const [isFocused, setIsFocused] = useState(false);
    const { updateCard, updateCardLoading } = useUpdateCard();
    const { user } = useAuth();
    const { voteCard } = useVoteCard(card.id);
    const { deleteCard, deleteCardLoading } = useDeleteCard(card.id);
    const { focusCard, focusCardLoading } = useFocusCard(card.id);
    const [highlightCard, setHighlightCard] = useState(false);
    const { isBoardOwner } = useBoardState();

    useEffect(() => {
      const onFocus = (id: string) => {
        if (id !== card.id) return;
        setHighlightCard(true);
        setTimeout(() => {
          setHighlightCard(false);
        }, 3000);
      };
      eventEmitter.addListener('focus', onFocus);
      return () => {
        eventEmitter.removeListener('focus', onFocus);
      };
    }, [card.id]);

    const hasChildren = useMemo(() => {
      if (!card.children) return false;
      return card.children.length > 0;
    }, [card]);

    useEffect(() => {
      if (isFocused) return;
      if (value !== card?.content) {
        setValue(card?.content);
      }
    }, [value, card?.content, isFocused]);

    const handleChange = (value: string) => {
      setValue(value);
      updateCard({ cardId: card.id, payload: { content: value } });
    };

    const isCardOwner = user?.id === card.ownerId;

    return (
      <Draggable
        key={card.id}
        draggableId={card.id}
        index={index}
        isDragDisabled={!isCardOwner}
      >
        {(
          dragProvided: DraggableProvided,
          dragSnapshot: DraggableStateSnapshot,
        ) => (
          <AnimatePresence>
            <div
              className="relative w-full"
              {...dragProvided.draggableProps}
              {...dragProvided.dragHandleProps}
              data-testid={`card-${index}`}
              ref={dragProvided.innerRef}
              style={getStyle(dragProvided.draggableProps.style, dragSnapshot)}
            >
              <div ref={ref} />
              <AlertBadge
                count={card.children?.length ?? 0}
                show={hasChildren}
              />
              <motion.div
                className={containerClasses({
                  isDragging: dragSnapshot.isDragging,
                  isGroupedOver: Boolean(dragSnapshot.combineTargetFor),
                  hasChildren: hasChildren,
                  highlightCard: highlightCard,
                })}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                key={card.id}
              >
                <HoldBar data-testid={`card-${index}-hold`} />
                <InputContainer>
                  <HoldIcon />
                  <Textarea
                    className="border-none w-full focus:outline-none focus:ring-0 focus:shadow-none focus:border-transparent flex-1 resize-none p-2 bg-transparent"
                    value={value}
                    onChange={handleChange}
                    disabled={!isCardOwner}
                    readonly={!isCardOwner}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                  />
                </InputContainer>
                <CardDetails>
                  <CardVotesContainer>
                    <CardVotesButton
                      onClick={() => voteCard({ increment: true })}
                    >
                      <ArrowUpIcon className="w-6 h-6" />
                    </CardVotesButton>
                    <p>{card.votes}</p>
                    <CardVotesButton
                      onClick={() => voteCard({ increment: false })}
                    >
                      <ArrowDownIcon className="w-6 h-6" />
                    </CardVotesButton>
                  </CardVotesContainer>
                  <div>
                    {isCardOwner ||
                      (isBoardOwner && (
                        <Tooltip label="Delete card">
                          <IconButton onClick={() => deleteCard()}>
                            {deleteCardLoading ? <Spinner /> : <DeleteIcon />}
                          </IconButton>
                        </Tooltip>
                      ))}
                    {isBoardOwner && (
                      <Tooltip label="Focus card">
                        <IconButton onClick={() => focusCard()}>
                          {<ViewIcon />}
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip label={card.owner.githubNickname}>
                      <Avatar size="xs" src={card.owner.avatar} />
                    </Tooltip>
                  </div>
                </CardDetails>
              </motion.div>
            </div>
          </AnimatePresence>
        )}
      </Draggable>
    );
  },
);
