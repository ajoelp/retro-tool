import { Column } from '@prisma/client';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
import { useAuth } from '../../contexts/AuthProvider';
import { useUpdateCard } from '../../hooks/cards';
import { RingShadow } from '../../theme/shadows';
import { Avatar, Badge, Spinner } from '@chakra-ui/react';
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
} from '@heroicons/react/outline';

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
`;

export const CardInput = styled.textarea`
  width: 100%;
  flex: 1;
  resize: none;
  padding: 1rem;

  &:focus {
    outline: none;
    border: none;
    box-shadow: ${RingShadow};
  }
`;

const CardDetails = styled.div`
  display: flex;
  padding: 0.5rem;
  justify-content: space-between;
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

  const hasChildren = useMemo(() => {
    if (!card.children) return false;
    return card.children.length > 0;
  }, [card]);

  useEffect(() => {
    if (isFocused) return;
    if (value !== card?.content) {
      setValue(card?.content);
    }
  }, [value, card?.content]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value);
    updateCard({ cardId: card.id, payload: { content: event.target.value } });
  };

  const isOwner = user?.id === card.ownerId;

  return (
    <Draggable key={card.id} draggableId={card.id} index={index}>
      {(
        dragProvided: DraggableProvided,
        dragSnapshot: DraggableStateSnapshot,
      ) => (
        <CardWrapper
          key={card.id}
          isDragging={dragSnapshot.isDragging}
          isGroupedOver={Boolean(dragSnapshot.combineTargetFor)}
          hasChildren={hasChildren}
          ref={dragProvided.innerRef}
          {...dragProvided.draggableProps}
          {...dragProvided.dragHandleProps}
          style={getStyle(dragProvided.draggableProps.style, dragSnapshot)}
        >
          <HoldBar />
          {isOwner ? (
            <CardInput
              value={value}
              onChange={handleChange}
              disabled={!isOwner}
            />
          ) : (
            <CardInput
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              as="p"
            >
              {value}
            </CardInput>
          )}
          <CardDetails>
            <CardVotesContainer>
              <CardVotesButton>
                <ArrowCircleUpIcon />
              </CardVotesButton>
              <p>12</p>
              <CardVotesButton>
                <ArrowCircleDownIcon />
              </CardVotesButton>
            </CardVotesContainer>
            <div>
              {updateCardLoading && <Loader size="xs" />}
              <Avatar size="xs" src={card.owner.avatar} />
            </div>
            {hasChildren && (
              <div>
                <Badge>{card.children?.length}</Badge>
              </div>
            )}
          </CardDetails>
        </CardWrapper>
      )}
    </Draggable>
  );
};
