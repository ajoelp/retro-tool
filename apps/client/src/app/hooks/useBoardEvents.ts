import { io } from 'socket.io-client'
import {useCallback, useEffect, useMemo} from "react";
import {
  BOARD_UPDATED_EVENT_NAME,
  CARD_CREATED_EVENT_NAME, COLUMN_CREATED_EVENT_NAME, COLUMN_DELETED_EVENT_NAME,
  SocketEvents
} from "../../../../../libs/api-interfaces/src/lib/socket-events";
import {useQueryClient} from "react-query";
import {Board, Card, Column} from "@prisma/client";

export function useBoardEvents(boardId: string){
  const queryClient = useQueryClient()
  const socketUrl = `http://localhost:3333/boards/${boardId}`
  const socket = useMemo(() => boardId ? io(socketUrl) : undefined, [socketUrl, boardId])

  const processEvent = useCallback((event: SocketEvents) => {
    switch (event.type){
      case CARD_CREATED_EVENT_NAME:
        queryClient.setQueryData<Card[]>(['cards', event.payload.columnId], (oldData) => {
          return [
            ...oldData ?? [],
            event.payload
          ]
        })
        return;
      case COLUMN_CREATED_EVENT_NAME:
        queryClient.setQueryData<Column[]>(['columns', event.payload.boardId], (oldData) => {
          return [
            ...oldData ?? [],
            event.payload
          ]
        })
        return;
      case COLUMN_DELETED_EVENT_NAME:
        queryClient.setQueryData<Column[]>(['columns', event.payload.boardId], (oldData) => {
          return (oldData ?? []).filter(data => data.id !== event.payload.id)
        })
        return;
      case BOARD_UPDATED_EVENT_NAME:
        queryClient.setQueryData<Board>(['board', event.payload.id], event.payload)
        return;
      default:
        return
    }
  }, [queryClient])

  useEffect(() => {
    socket?.on('connect', () => {
      console.log('Connected to WS')
    })

    socket?.on('event', processEvent)

    socket?.on('disconnect', () => {
      console.log('Disconnected from WS')
    })

    return () => {
      socket?.close();
    }
  }, [processEvent, socket])


}
