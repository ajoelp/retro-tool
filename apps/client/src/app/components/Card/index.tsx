import { Card as CardType, Column } from '@prisma/client';
import { ChangeEvent, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthProvider';
import { useUpdateCard } from '../../hooks/cards';
import { RingShadow } from '../../theme/shadows';
import { Avatar, Spinner } from '@chakra-ui/react';
import { CardWithOwner } from '@retro-tool/api-interfaces';
import { ArrowCircleDownIcon, ArrowCircleUpIcon } from '@heroicons/react/solid';
import { primaryColor } from '../../theme/colors';

type CardWrapperProps = {
  padding?: boolean;
};

type CardProps = {
  column: Column;
  card: CardWithOwner;
};

export const CardWrapper = styled.div`
  position: relative;
  width: 100%;
  min-height: 9rem;
  background-color: white;
  border: 1px solid #efefef;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  border-radius: 0.3rem;
  overflow: hidden;
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

export const Card: React.FC<CardProps> = ({ card }) => {
  const [value, setValue] = useState(card?.content);
  const { updateCard, updateCardLoading } = useUpdateCard();
  const { user } = useAuth();

  useEffect(() => {
    setValue(card?.content);
  }, [card?.content]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value);
    updateCard({ cardId: card.id, content: event.target.value });
  };

  const isOwner = user?.id === card.ownerId;

  return (
    <CardWrapper>
      <HoldBar />
      {isOwner ? (
        <CardInput value={value} onChange={handleChange} disabled={!isOwner} />
      ) : (
        <CardInput as="p">{value}</CardInput>
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
      </CardDetails>
    </CardWrapper>
  );
};
