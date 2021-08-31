import { Board, Card, Column } from '@prisma/client';
import axios from 'axios';

export type BoardWithColumn = Board & {
  columns: Column[];
};

export type createBoardArgs = {
  title: string;
  columns: string[];
  userId: string;
};

export type addColumnArgs = {
  boardId: string;
  title: string;
};

export type deleteColumnArgs = {
  columnId: string;
};

export type fetchCardsArgs = {
  columnId: string;
};

export type createCardsArgs = {
  columnId: string;
  content: string;
};

const api = {
  createBoard: ({ title, columns, userId }: createBoardArgs) =>
    axios.post('http://localhost:3333/boards', { title, columns, userId }),
  fetchBoard: async (id: string): Promise<Board> => {
    const { data } = await axios.get(`http://localhost:3333/boards/${id}`);
    return data.board;
  },
  fetchColumns: async (boardId: string): Promise<Column[]> => {
    const { data } = await axios.get(`http://localhost:3333/columns`, {
      params: { boardId },
    });
    return data.columns;
  },
  addColumn: async ({ boardId, title }: addColumnArgs): Promise<Column> => {
    const { data } = await axios.post('http://localhost:3333/columns/', {
      boardId,
      title,
    });
    return data.column;
  },
  deleteColumn: ({ columnId }: deleteColumnArgs) => {
    return axios.delete(`http://localhost:3333/columns/${columnId}`);
  },
  fetchCards: async ({ columnId }: fetchCardsArgs): Promise<Card[]> => {
    const { data } = await axios.get('http://localhost:3333/cards', {
      params: { columnId },
    });
    return data.cards;
  },
  createCard: async (payload: createCardsArgs): Promise<Card> => {
    const { data } = await axios.post('http://localhost:3333/cards', payload);
    return data.card;
  },
};

export default api;
