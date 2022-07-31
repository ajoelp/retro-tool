import { apiClient } from './../api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, Column } from '@prisma/client';
import { CardType } from '@retro-tool/api-interfaces';
import { useCallback, useRef, useState } from 'react';

export function useCards(columnId: string) {
  const { data, isLoading, refetch } = useQuery(['cards', columnId], async () => {
    const { data } = await apiClient.get('/cards', { params: { columnId } });
    return data.cards as CardType[];
  });
  return {
    cards: data,
    cardsLoading: isLoading,
    refetchCards: refetch,
  };
}

type CreateCardArgs = {
  content: string;
  draft: boolean;
};

export function useCreateCard(columnId: string) {
  const { mutateAsync, isLoading } = useMutation(async ({ content, draft }: CreateCardArgs) => {
    const { data } = await apiClient.post('/cards', { columnId, content, draft });
    return data.card as CardType;
  });
  return { createCard: mutateAsync, createCardLoading: isLoading };
}

export type UpdateCardArgs = {
  cardId: string;
  payload: Partial<Omit<Card, 'id'>>;
};

export function useUpdateCard() {
  const { mutateAsync, isLoading } = useMutation(async ({ cardId, payload }: UpdateCardArgs) => {
    const { data } = await apiClient.post(`/cards/${cardId}`, {
      payload,
    });
    return data.card;
  });
  return {
    updateCard: mutateAsync,
    updateCardLoading: isLoading,
  };
}

export type VoteCardArgs = {
  increment: boolean;
  times: number;
};

type GenericFunction = (...args: any[]) => any;
function useDebounceWithCalls<T extends GenericFunction>(fn: T, timeout = 300) {
  const timer = useRef<NodeJS.Timer>();
  const [calls, setCalls] = useState(1);

  const method = useCallback(
    (...args: Parameters<T>) => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      setCalls((c) => c + 1);
      timer.current = setTimeout(async () => {
        setCalls(0);
        fn(...args);
      }, 300);
    },
    [fn],
  );

  return [method, calls] as [T, number];
}

export function useVoteCard(cardId: string) {
  const { mutateAsync, isLoading } = useMutation(({ increment, times = 0 }: VoteCardArgs) =>
    apiClient.post(`/cards/${cardId}/vote`, { increment, times }),
  );

  const [debouncedMutate, calls] = useDebounceWithCalls(mutateAsync);

  const voteCard = useCallback(
    ({ increment }: Omit<VoteCardArgs, 'times'>) => {
      return debouncedMutate({ increment, times: calls });
    },
    [calls, debouncedMutate],
  );

  return {
    voteCard,
    voteLoading: isLoading,
  };
}

export function useDeleteCard(cardId: string) {
  const { mutateAsync, isLoading } = useMutation(() => apiClient.delete(`/cards/${cardId}`));
  return {
    deleteCard: mutateAsync,
    deleteCardLoading: isLoading,
  };
}

export function useFocusCard(cardId: string) {
  const { mutateAsync, isLoading } = useMutation(() => apiClient.post(`/cards/${cardId}/focusCard`));
  return {
    focusCard: mutateAsync,
    focusCardLoading: isLoading,
  };
}

export function usePublishCards(columnId: Column['id']) {
  const { mutateAsync, isLoading } = useMutation(() => {
    return apiClient.post('/bulk/cards/publish', { columnId });
  });
  return { publishCards: mutateAsync, publishCardsLoading: isLoading };
}
