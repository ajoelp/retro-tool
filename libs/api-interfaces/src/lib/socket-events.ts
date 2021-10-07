import { Card, Column, Board } from '@prisma/client';

export const CARD_CREATED_EVENT_NAME = 'events/CARD_CREATED' as const;
export const CARD_UPDATED_EVENT_NAME = 'events/CARD_UPDATED' as const;
export const CARD_DELETED_EVENT_NAME = 'events/CARD_DELETED' as const;
export const CARD_FOCUS_EVENT_NAME = 'events/CARD_FOCUSED' as const;

export const COLUMN_CREATED_EVENT_NAME = 'events/COLUMN_CREATED' as const;
export const COLUMN_UPDATED_EVENT_NAME = 'events/COLUMN_UPDATED' as const;
export const COLUMN_DELETED_EVENT_NAME = 'events/COLUMN_DELETED' as const;

export const BOARD_UPDATED_EVENT_NAME = 'events/BOARD_UPDATED' as const;

export type CARD_CREATED_EVENT = {
  type: typeof CARD_CREATED_EVENT_NAME;
  payload: Card;
};

export type CARD_UPDATED_EVENT = {
  type: typeof CARD_UPDATED_EVENT_NAME;
  payload: Card;
};

export type CARD_DELETED_EVENT = {
  type: typeof CARD_DELETED_EVENT_NAME;
  payload: Card;
};

export type CARD_FOCUS_EVENT = {
  type: typeof CARD_FOCUS_EVENT_NAME;
  payload: Card;
};

export type COLUMN_CREATED_EVENT = {
  type: typeof COLUMN_CREATED_EVENT_NAME;
  payload: Column;
};

export type COLUMN_UPDATED_EVENT = {
  type: typeof COLUMN_UPDATED_EVENT_NAME;
  payload: Column;
};

export type COLUMN_DELETED_EVENT = {
  type: typeof COLUMN_DELETED_EVENT_NAME;
  payload: Column;
};

export type BOARD_UPDATED_EVENT = {
  type: typeof BOARD_UPDATED_EVENT_NAME;
  payload: Board;
};

export type SocketEvents =
  | CARD_CREATED_EVENT
  | CARD_UPDATED_EVENT
  | CARD_DELETED_EVENT
  | CARD_FOCUS_EVENT
  | COLUMN_CREATED_EVENT
  | COLUMN_UPDATED_EVENT
  | COLUMN_DELETED_EVENT
  | BOARD_UPDATED_EVENT;
