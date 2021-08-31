import {useMutation, useQuery} from "react-query";
import api from "../api";

export const useColumns = (boardId: string) => {
  const { data, isLoading } = useQuery(['columns', boardId], () => api.fetchColumns(boardId))
  return {
    columns: data,
    columnsLoading: isLoading
  }
}

export const useUpdateBoard = () => {
  return useMutation(api.addColumn)
}

export const useDeleteColumn = () => {
  return useMutation(api.deleteColumn)
}
