import { Column } from '@prisma/client';
import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
} from 'react';
import styled, { css } from 'styled-components';
import { useAuth } from '../../contexts/AuthProvider';
import {
  useDeleteCard,
  useFocusCard,
  useUpdateCard,
  useVoteCard,
} from '../../hooks/cards';
import { RingShadow } from '../../theme/shadows';
import { Avatar, Badge, Box, Spinner, Tooltip, useColorModeValue } from '@chakra-ui/react';
import { CardType } from '@retro-tool/api-interfaces';
import { primaryColor } from '../../theme/colors';
import {
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
  DraggingStyle,
  NotDraggingStyle,
} from 'react-beautiful-dnd';
import {
  ArrowCircleDownIcon,
  ArrowCircleUpIcon,
  MenuIcon,
} from '@heroicons/react/outline';
import { DeleteIcon, ViewIcon } from '@chakra-ui/icons';
import { Textarea } from '../Textarea';
import { eventEmitter } from '../../utils/EventEmitter';
import { useBoardState } from '../../contexts/BoardProvider';

type CardProps = {
  column: Column;
  card: CardType;
  index: number;
  isClone?: boolean;
};

type CardWrapperProps = {
  isDragging: boolean;
  isGroupedOver: boolean;
  hasChildren: boolean;
  highlightCard: boolean;
};

const StackedBoxShadow = `0 1px 1px rgba(0,0,0,0.15), 0 10px 0 -5px #eee, 0 10px 1px -4px rgba(0,0,0,0.15), 0 20px 0 -10px #eee, 0 20px 1px -9px rgba(0,0,0,0.15)`;

export const CardWrapper = styled(Box) <CardWrapperProps>`
  ${({ isDragging }) =>
    isDragging &&
    css`
      opacity: 0.8;
    `}
  ${({ isGroupedOver, highlightCard }) =>
    (isGroupedOver || highlightCard) &&
    css`
      box-shadow: ${RingShadow};
    `}
  position: relative;
  width: 100%;
  min-height: 9rem;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  border-radius: 0.3rem;
  overflow: hidden;
  z-index: 10;
  top: 0;
  left: 0;
  &:focus-within {
    outline: none;
    border: none;
    box-shadow: ${RingShadow};
  }
  ${({ hasChildren, isGroupedOver, highlightCard }) =>
    hasChildren &&
    css`
      box-shadow: ${StackedBoxShadow};
      &:focus-within {
        outline: none;
        border: none;
        box-shadow: ${RingShadow}, ${StackedBoxShadow};
      }

      ${(isGroupedOver || highlightCard) &&
      css`
        box-shadow: ${RingShadow}, ${StackedBoxShadow};
      `}
    `}
`;

export const CardInput = styled(Textarea)`
  width: 100%;
  flex: 1;
  resize: none;
  padding: 1rem;
  background-color: transparent;
  &:focus {
    outline: none;
  }
`;

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
    const containerBackgroundColor = useColorModeValue("white", "gray.800")
    const containerBorderColor = useColorModeValue("gray.200", "gray.700")

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
          <DragWrapper
            {...dragProvided.draggableProps}
            {...dragProvided.dragHandleProps}
            data-testid={`card-${index}`}
            ref={dragProvided.innerRef}
            style={getStyle(dragProvided.draggableProps.style, dragSnapshot)}
          >
            <div ref={ref} />
            <CardWrapper
              key={card.id}
              isDragging={dragSnapshot.isDragging}
              isGroupedOver={Boolean(dragSnapshot.combineTargetFor)}
              hasChildren={hasChildren}
              highlightCard={highlightCard}
              backgroundColor={containerBackgroundColor}
              borderColor={containerBorderColor}
            >
              <HoldBar data-testid={`card-${index}-hold`} />
              <InputContainer>
                <HoldIcon />
                {isCardOwner ? (
                  <CardInput
                    value={value}
                    onChange={handleChange}
                    disabled={!isCardOwner}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                  />
                ) : (
                  <CardInput as="p">{value}</CardInput>
                )}
              </InputContainer>
              <CardDetails>
                <CardVotesContainer>
                  <CardVotesButton
                    onClick={() => voteCard({ increment: true })}
                  >
                    <ArrowCircleUpIcon />
                  </CardVotesButton>
                  <p>{card.votes}</p>
                  <CardVotesButton
                    onClick={() => voteCard({ increment: false })}
                  >
                    <ArrowCircleDownIcon />
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
                  {hasChildren && (
                    <Badge mr="2">{card.children?.length ?? 0 + 1}</Badge>
                  )}
                  <Tooltip label={card.owner.githubNickname}>
                    <Avatar size="xs" src={card.owner.avatar} />
                  </Tooltip>
                </div>
              </CardDetails>
            </CardWrapper>
          </DragWrapper>
        )}
      </Draggable>
    );
  },
);
