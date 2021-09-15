import { useIgnoredEvents } from './../contexts/IgnoredEventsContext';
import { io, Socket } from 'socket.io-client';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  BOARD_UPDATED_EVENT_NAME,
  CARD_CREATED_EVENT_NAME,
  CARD_UPDATED_EVENT_NAME,
  COLUMN_CREATED_EVENT_NAME,
  COLUMN_DELETED_EVENT_NAME,
  COLUMN_UPDATED_EVENT_NAME,
  SocketEvents,
} from '@retro-tool/api-interfaces';
import { useQueryClient } from 'react-query';
import { Board, Card, Column } from '@prisma/client';
import Cookies from 'js-cookie';
import { environment } from '../../environments/environment.prod';

type EventType = SocketEvents & { eventTrackingId?: string }

export function useBoardEvents(boardId: string) {
  const queryClient = useQueryClient();
  const { ignoredEvents } = useIgnoredEvents()
  const socket = useRef<Socket>()

  const processEvent = useCallback(
    (event: EventType) => {
      if (event.eventTrackingId && ignoredEvents.includes(event.eventTrackingId)) return;
      switch (event.type) {
        case CARD_CREATED_EVENT_NAME:
          queryClient.setQueryData<Card[]>(
            ['cards', event.payload.columnId],
            (oldData) => {
              return [...(oldData ?? []), event.payload];
            },
          );
          return;
        case CARD_UPDATED_EVENT_NAME:
          queryClient.setQueryData<Card[]>(
            ['cards', event.payload.columnId],
            (oldData) => {
              return (
                oldData?.map((card) => {
                  return card.id === event.payload.id ? event.payload : card;
                }) ?? []
              );
            },
          );
          return;
        case COLUMN_UPDATED_EVENT_NAME:
          queryClient.setQueryData<Column[]>(
            ['columns', event.payload.boardId],
            (oldData) => {
              return (
                oldData?.map((column) => {
                  return column.id === event.payload.id
                    ? event.payload
                    : column;
                }) ?? []
              );
            },
          );
          return;
        case COLUMN_CREATED_EVENT_NAME:
          queryClient.setQueryData<Column[]>(
            ['columns', event.payload.boardId],
            (oldData) => {
              return [...(oldData ?? []), event.payload];
            },
          );
          return;
        case COLUMN_DELETED_EVENT_NAME:
          queryClient.setQueryData<Column[]>(
            ['columns', event.payload.boardId],
            (oldData) => {
              return (oldData ?? []).filter(
                (data) => data.id !== event.payload.id,
              );
            },
          );
          return;
        case BOARD_UPDATED_EVENT_NAME:
          queryClient.setQueryData<Board>(
            ['board', event.payload.id],
            event.payload,
          );
          return;
        default:
          return;
      }
    },
    [ignoredEvents, queryClient],
  );

  const setUsers = useCallback((users) => {
    queryClient.setQueryData(['activeUsers', { boardId }], () => users)
  }, [boardId, queryClient])

  useEffect(() => {
    socket.current = io(`${environment.apiUrl}/boards/${boardId}`, { auth: { token: Cookies.get('auth_token') } })
    socket.current?.on('connect', () => {
      console.log('Connected to WS');
    });

    socket.current?.on('event', processEvent);

    socket.current?.on('users', setUsers)

    socket.current?.on('disconnect', (e) => {
      console.log('Disconnected from WS', e);
    });

    return () => {
      socket.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);
}
