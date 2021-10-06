import { Column } from '@prisma/client';
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { useAuth } from '../../contexts/AuthProvider';
import { useDeleteCard, useUpdateCard, useVoteCard } from '../../hooks/cards';
import { RingShadow } from '../../theme/shadows';
import { Avatar, Badge, Spinner, Tooltip } from '@chakra-ui/react';
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
import { DeleteIcon } from '@chakra-ui/icons';
import { Textarea } from '../Textarea';

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
};

const StackedBoxShadow = `0 1px 1px rgba(0,0,0,0.15), 0 10px 0 -5px #eee, 0 10px 1px -4px rgba(0,0,0,0.15), 0 20px 0 -10px #eee, 0 20px 1px -9px rgba(0,0,0,0.15)`;

export const CardWrapper = styled.div<CardWrapperProps>`
  ${({ isDragging }) =>
    isDragging &&
    css`
      opacity: 0.8;
    `}
  background-color: white;
  ${({ isGroupedOver }) =>
    isGroupedOver &&
    css`
      box-shadow: ${RingShadow};
    `}
  position: relative;
  width: 100%;
  min-height: 9rem;
  border: 1px solid #efefef;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  border-radius: 0.3rem;
  overflow: hidden;
  background-color: white;
  z-index: 10;
  top: 0;
  left: 0;
  &:focus-within {
    outline: none;
    border: none;
    box-shadow: ${RingShadow};
  }
  ${({ hasChildren, isGroupedOver }) =>
    hasChildren &&
    css`
      box-shadow: ${StackedBoxShadow};
      &:focus-within {
        outline: none;
        border: none;
        box-shadow: ${RingShadow}, ${StackedBoxShadow};
      }

      ${isGroupedOver &&
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

const DeleteIconButton = styled.button`
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

export const Card: React.FC<CardProps> = ({ card, index }) => {
  const [value, setValue] = useState(card?.content);
  const [isFocused, setIsFocused] = useState(false);
  const { updateCard, updateCardLoading } = useUpdateCard();
  const { user } = useAuth();
  const { voteCard } = useVoteCard(card.id);
  const { deleteCard, deleteCardLoading } = useDeleteCard(card.id);

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

  const isOwner = user?.id === card.ownerId;

  return (
    <Draggable
      key={card.id}
      draggableId={card.id}
      index={index}
      isDragDisabled={!isOwner}
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
          <CardWrapper
            key={card.id}
            isDragging={dragSnapshot.isDragging}
            isGroupedOver={Boolean(dragSnapshot.combineTargetFor)}
            hasChildren={hasChildren}
          >
            <HoldBar data-testid={`card-${index}-hold`} />
            <InputContainer>
              <HoldIcon />
              {isOwner ? (
                <CardInput
                  value={value}
                  onChange={handleChange}
                  disabled={!isOwner}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
              ) : (
                <CardInput as="p">{value}</CardInput>
              )}
            </InputContainer>
            <CardDetails>
              <CardVotesContainer>
                <CardVotesButton onClick={() => voteCard({ increment: true })}>
                  <ArrowCircleUpIcon />
                </CardVotesButton>
                <p>{card.votes}</p>
                <CardVotesButton onClick={() => voteCard({ increment: false })}>
                  <ArrowCircleDownIcon />
                </CardVotesButton>
              </CardVotesContainer>
              <div>
                {isOwner && (
                  <Tooltip title="Delete card">
                    <DeleteIconButton onClick={() => deleteCard()}>
                      {deleteCardLoading ? <Spinner /> : <DeleteIcon />}
                    </DeleteIconButton>
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
};
