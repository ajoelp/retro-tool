import { Board, Column, User } from '@prisma/client';
import axios from 'axios';
import Cookies from 'js-cookie';
import { CardWithOwner } from '@retro-tool/api-interfaces';
import { environment } from '../environments/environment.prod';

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

export type reorderColumnArgs = {
  boardId: string;
  sourceIndex: number;
  destinationIndex: number;
  eventTrackingId: string;
};

export type fetchCardsArgs = {
  columnId: string;
};

export type createCardsArgs = {
  columnId: string;
  content: string;
};

export type updateCardArgs = {
  cardId: string;
  content: string;
  eventTrackingId: string;
};

const apiClient = axios.create({
  baseURL: environment.apiUrl,
});

apiClient.interceptors.request.use(
  function (config) {
    const token = Cookies.get('auth_token');
    if (token != null) {
      config.headers.Authorization = token;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

// Add a response interceptor
apiClient.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    return Promise.reject(error);
  },
);

const api = {
  getCurrentUser: async (): Promise<User> => {
    const { data } = await apiClient.get('/auth/me');
    return data.user;
  },
  createBoard: ({ title, columns, userId }: createBoardArgs) =>
    apiClient.post('/boards', { title, columns, userId }),
  fetchBoard: async (id: string): Promise<Board> => {
    const { data } = await apiClient.get(`/boards/${id}`);
    return data.board;
  },
  fetchColumns: async (boardId: string): Promise<Column[]> => {
    const { data } = await apiClient.get(`/columns`, {
      params: { boardId },
    });
    return data.columns;
  },
  addColumn: async ({ boardId, title }: addColumnArgs): Promise<Column> => {
    const { data } = await apiClient.post('/columns/', {
      boardId,
      title,
    });
    return data.column;
  },
  deleteColumn: ({ columnId }: deleteColumnArgs) => {
    return apiClient.delete(`/columns/${columnId}`);
  },
  redorderColumn: ({
    boardId,
    sourceIndex,
    destinationIndex,
    eventTrackingId
  }: reorderColumnArgs) => {
    return apiClient.post(`/columns/reorder`, {
      boardId,
      sourceIndex,
      destinationIndex,
      eventTrackingId
    });
  },
  fetchCards: async ({
    columnId,
  }: fetchCardsArgs): Promise<CardWithOwner[]> => {
    const { data } = await apiClient.get('/cards', {
      params: { columnId },
    });
    return data.cards;
  },
  createCard: async (payload: createCardsArgs): Promise<CardWithOwner> => {
    const { data } = await apiClient.post('/cards', payload);
    return data.card;
  },
  updateCard: async ({
    cardId,
    content,
    eventTrackingId
  }: updateCardArgs): Promise<CardWithOwner> => {
    const { data } = await apiClient.post(`/cards/${cardId}`, { content, eventTrackingId });
    return data.card;
  },
};

export default api;
