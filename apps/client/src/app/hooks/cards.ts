import { apiClient } from './../api';
import { useMutation, useQuery } from 'react-query';
import api from '../api';
import { Card } from '@prisma/client';

export function useCards(columnId: string) {
  const { data, isLoading, refetch } = useQuery(['cards', columnId], () =>
    api.fetchCards({ columnId }),
  );
  return {
    cards: data,
    cardsLoading: isLoading,
    refetchCards: refetch,
  };
}

type createCardArgs = {
  content: string;
};

export function useCreateCard(columnId: string) {
  const { mutateAsync, isLoading } = useMutation(
    ({ content }: createCardArgs) => api.createCard({ columnId, content }),
  );
  return { createCard: mutateAsync, createCardLoading: isLoading };
}

export type UpdateCardArgs = {
  cardId: string;
  payload: Partial<Omit<Card, 'id'>>;
};

export function useUpdateCard() {
  const { mutateAsync, isLoading } = useMutation(
    ({ cardId, payload }: UpdateCardArgs) => {
      return api.updateCard({ cardId, payload });
    },
  );
  return {
    updateCard: mutateAsync,
    updateCardLoading: isLoading,
  };
}


export type VoteCardArgs = {
  increment: boolean;
}
export function useVoteCard(cardId: string) {
  const { mutateAsync, isLoading } = useMutation(
    ({ increment }: VoteCardArgs) => apiClient.post(`/cards/${cardId}/vote`, { increment })
  )
  return {
    voteCard: mutateAsync,
    voteLoading: isLoading
  }
}
