/* eslint-disable no-case-declarations */
import { useIgnoredEvents } from './../contexts/IgnoredEventsContext';
import { io, Socket } from 'socket.io-client';
import { useCallback, useEffect, useRef } from 'react';
import {
  BOARD_UPDATED_EVENT_NAME,
  CARD_CREATED_EVENT_NAME,
  CARD_DELETED_EVENT_NAME,
  CARD_FOCUS_EVENT_NAME,
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
import update from 'immutability-helper';
import { eventEmitter } from '../utils/EventEmitter';

type EventType = SocketEvents & { eventTrackingId?: string };

export function useBoardEvents(boardId: string) {
  const queryClient = useQueryClient();
  const { ignoredEvents } = useIgnoredEvents();
  const socket = useRef<Socket>();

  const processEvent = useCallback(
    (event: EventType) => {
      if (
        event.eventTrackingId &&
        ignoredEvents.includes(event.eventTrackingId)
      )
        return;
      switch (event.type) {
        case CARD_CREATED_EVENT_NAME:
          queryClient.setQueryData<Card[]>(
            ['cards', event.payload.columnId],
            (oldData) => update(oldData ?? [], { $push: [event.payload] }),
          );
          return;
        case CARD_UPDATED_EVENT_NAME:
          // Get all the columns from inside the board
          const columnIds = (
            queryClient.getQueryData<Column[]>(['columns', boardId]) ?? []
          ).map((column) => column.id);

          // Find the previous column id
          const cardPreviousColumnId = columnIds.find((id: string) => {
            return (queryClient.getQueryData<Card[]>(['cards', id]) ?? []).find(
              (card) => card.id === event.payload.id,
            );
          });

          // If the id's are different remove it from the old one
          if (cardPreviousColumnId !== event.payload.columnId) {
            queryClient.setQueryData<Card[]>(
              ['cards', cardPreviousColumnId],
              (oldData = []) => {
                const index = oldData.findIndex(
                  (card) => card.id === event.payload.id,
                );
                return update(oldData, { $splice: [[index, 1]] });
              },
            );
          }

          queryClient.setQueryData<Card[]>(
            ['cards', event.payload.columnId],
            (oldData = []) => {
              const index = oldData.findIndex(
                (card) => card.id === event.payload.id,
              );
              if (index < 0) {
                return update(oldData, { $push: [event.payload] });
              }
              return update(oldData, { [index]: { $set: event.payload } });
            },
          );
          return;

        case COLUMN_UPDATED_EVENT_NAME:
          queryClient.setQueryData<Column[]>(
            ['columns', event.payload.boardId],
            (oldData = []) => {
              const index = oldData.findIndex(
                (column) => column.id === event.payload.id,
              );
              return update(oldData, {
                [index]: { $set: event.payload },
              });
            },
          );
          return;
        case COLUMN_CREATED_EVENT_NAME:
          queryClient.setQueryData<Column[]>(
            ['columns', event.payload.boardId],
            (oldData = []) => update(oldData, { $push: [event.payload] }),
          );
          return;
        case COLUMN_DELETED_EVENT_NAME:
          queryClient.setQueryData<Column[]>(
            ['columns', event.payload.boardId],
            (oldData = []) => {
              const index = oldData.findIndex(
                (column) => column.id === event.payload.id,
              );
              return update(oldData, { $splice: [[index, 1]] });
            },
          );
          return;
        case CARD_DELETED_EVENT_NAME:
          queryClient.setQueryData<Card[]>(
            ['cards', event.payload.columnId],
            (oldData = []) => {
              const index = oldData.findIndex(
                (card) => card.id === event.payload.id,
              );
              return update(oldData, { $splice: [[index, 1]] });
            },
          );
          return;
        case CARD_FOCUS_EVENT_NAME:
          eventEmitter.emit('focus', event.payload.id);
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
    [boardId, ignoredEvents, queryClient],
  );

  const setUsers = useCallback(
    (users) => {
      queryClient.setQueryData(['activeUsers', { boardId }], () => users);
    },
    [boardId, queryClient],
  );

  useEffect(() => {
    socket.current = io(`${environment.apiUrl}/boards/${boardId}`, {
      auth: { token: Cookies.get('auth_token') },
    });
    socket.current?.on('connect', () => {
      console.log('Connected to WS');
    });

    socket.current?.on('event', processEvent);

    socket.current?.on('users', setUsers);

    socket.current?.on('disconnect', (e) => {
      console.log('Disconnected from WS', e);
    });

    return () => {
      socket.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);
}
