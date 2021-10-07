import { apiClient } from './../api';
import { useMutation, useQuery } from 'react-query';
import { Card } from '@prisma/client';
import { CardType } from '@retro-tool/api-interfaces';

export function useCards(columnId: string) {
  const { data, isLoading, refetch } = useQuery(
    ['cards', columnId],
    async () => {
      const { data } = await apiClient.get('/cards', { params: { columnId } });
      return data.cards as CardType[];
    },
  );
  return {
    cards: data,
    cardsLoading: isLoading,
    refetchCards: refetch,
  };
}

type CreateCardArgs = {
  content: string;
};

export function useCreateCard(columnId: string) {
  const { mutateAsync, isLoading } = useMutation(
    async ({ content }: CreateCardArgs) => {
      const { data } = await apiClient.post('/cards', { columnId, content });
      return data.card as CardType;
    },
  );
  return { createCard: mutateAsync, createCardLoading: isLoading };
}

export type UpdateCardArgs = {
  cardId: string;
  payload: Partial<Omit<Card, 'id'>>;
};

export function useUpdateCard() {
  const { mutateAsync, isLoading } = useMutation(
    async ({ cardId, payload }: UpdateCardArgs) => {
      const { data } = await apiClient.post(`/cards/${cardId}`, {
        payload,
      });
      return data.card;
    },
  );
  return {
    updateCard: mutateAsync,
    updateCardLoading: isLoading,
  };
}

export type VoteCardArgs = {
  increment: boolean;
};
export function useVoteCard(cardId: string) {
  const { mutateAsync, isLoading } = useMutation(
    ({ increment }: VoteCardArgs) =>
      apiClient.post(`/cards/${cardId}/vote`, { increment }),
  );
  return {
    voteCard: mutateAsync,
    voteLoading: isLoading,
  };
}

export function useDeleteCard(cardId: string) {
  const { mutateAsync, isLoading } = useMutation(() =>
    apiClient.delete(`/cards/${cardId}`),
  );
  return {
    deleteCard: mutateAsync,
    deleteCardLoading: isLoading,
  };
}

export function useFocusCard(cardId: string) {
  const { mutateAsync, isLoading } = useMutation(() =>
    apiClient.post(`/cards/${cardId}/focusCard`),
  );
  return {
    focusCard: mutateAsync,
    focusCardLoading: isLoading,
  };
}
