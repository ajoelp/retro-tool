import { Card, User } from '@prisma/client';

export interface CardWithOwner extends Card {
  owner: User;
}
