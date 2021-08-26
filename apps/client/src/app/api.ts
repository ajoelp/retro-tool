import { Board, Category } from "@prisma/client";
import axios from "axios";

type BoardWithCategory = Board & {
  Category: Category[]
}

export type createBoardArgs = {
  title: string;
  columns: string[];
};

export type addColumnArgs = {
  boardId: string;
  title: string;
}

export type deleteColumnArgs = {
  columnId: string
}

const api = {
  createBoard: ({title, columns}: createBoardArgs) => axios.post('http://localhost:3333/boards', { title, columns }),
  fetchBoard: async (id: string): Promise<BoardWithCategory> => {
    const { data } = await axios.get(`http://localhost:3333/boards/${id}`);
    return data.board
  },
  addColumn: async ({boardId, title}:addColumnArgs): Promise<Category> => {
    const { data } = await axios.post('http://localhost:3333/categories/', { boardId, title })
    return data.category
  },
  deleteColumn: ({columnId}: deleteColumnArgs) => {
    return axios.delete(`http://localhost:3333/categories/${columnId}`)
  }
}

export default api
