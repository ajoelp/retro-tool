import { useMutation, useQuery, useQueryClient } from 'react-query';
import api from '../api';
import { AuthProvider } from '../contexts/AuthProvider';
import {v4 as uuid} from "uuid";
import {useIgnoredEvents} from "../contexts/IgnoredEventsContext";

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

type updateCardArgs = {
  cardId: string;
  content: string;
};

export function useUpdateCard() {
  const { addIgnoreId } = useIgnoredEvents()
  const { mutateAsync, isLoading } = useMutation(
    ({ cardId, content }: updateCardArgs) => {
      const eventTrackingId = uuid()
      addIgnoreId(eventTrackingId)
      return api.updateCard({ cardId, content, eventTrackingId })
    }
  );
  return {
    updateCard: mutateAsync,
    updateCardLoading: isLoading,
  };
}
