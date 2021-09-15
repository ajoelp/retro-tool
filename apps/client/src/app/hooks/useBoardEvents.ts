import { io } from 'socket.io-client';
import { useCallback, useEffect, useMemo } from 'react';
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

export function useBoardEvents(boardId: string) {
  const queryClient = useQueryClient();
  const socketUrl = `${environment.apiUrl}/boards/${boardId}`;
  const socket = useMemo(
    () => (boardId ? io(socketUrl, { auth: { token: Cookies.get('auth_token') } }) : undefined),
    [socketUrl, boardId],
  );

  const processEvent = useCallback(
    (event: SocketEvents) => {
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
    [queryClient],
  );

  useEffect(() => {
    socket?.on('connect', () => {
      console.log('Connected to WS');
    });

    socket?.on('event', processEvent);

    socket?.on('users', (users) => {
      queryClient.setQueryData(['activeUsers', { boardId }], () => users)
    })

    socket?.on('disconnect', () => {
      console.log('Disconnected from WS');
    });

    return () => {
      socket?.close();
    };
  }, [boardId, processEvent, queryClient, socket]);
}
