import { Card, User } from '@prisma/client';

export interface CardType extends Card {
  owner: User;
  children?: Omit<CardType, 'children'>[];
}

export type StartState = {
  type: 'start'
  state: {
    startTime: number
    endTime: number
  }
}

export type PausedState = {
  type: 'paused'
  state: {
    totalDuration: number
  }
}
