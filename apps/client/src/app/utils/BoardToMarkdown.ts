import { Board, Card, Column, User } from '@prisma/client';
import { QueryClient } from 'react-query';

const NL = '\n';

type CardWithOwner = Card & {
  owner: User;
};

type CardType = CardWithOwner & {
  children?: Omit<CardWithOwner, 'children'>[];
};

export class BoardToMarkdown {
  private queryClient: QueryClient;
  private boardId: Board['id'];
  private result = '';
  constructor(queryClient: QueryClient, boardId: Board['id']) {
    this.boardId = boardId;
    this.queryClient = queryClient;
  }

  private append(value: string) {
    this.result = this.result.concat(`${value}\n`);
  }

  private renderCardText(card: Card & { owner: User }) {
    const votes =
      card.votes !== 0 ? `(${card.votes > 0 ? '+' : ''}${card.votes})` : '';
    return `- [[${card.owner.githubNickname}]](https://github.com/${card.owner.githubNickname}): ${card.content} ${votes}`;
  }

  build(): string {
    const board = this.queryClient.getQueryData<Board>(['board', this.boardId]);
    if (!board) return this.result;

    this.append(`# ${board.title}\n`);

    const columns =
      this.queryClient.getQueryData<Column[]>(['columns', this.boardId]) ?? [];

    for (const column of columns) {
      if (columns.findIndex((col) => col.id === column.id) > 0) this.append('');
      this.append(`## ${column.title}\n`);

      const cards =
        this.queryClient.getQueryData<CardType[]>(['cards', column.id]) ?? [];

      for (const card of cards) {
        this.append(this.renderCardText(card));
        if (card.children) {
          for (const child of card.children) {
            this.append(`    ${this.renderCardText(child)}`);
          }
        }
      }
    }

    return this.result;
  }
}
