import { useMutation, useQuery, useQueryClient } from 'react-query';
import api from '../api';

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
