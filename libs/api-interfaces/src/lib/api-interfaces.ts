import { Card, User } from '@prisma/client';

export interface CardType extends Card {
  owner: User;
  children?: Omit<CardType, 'children'>[];
}
