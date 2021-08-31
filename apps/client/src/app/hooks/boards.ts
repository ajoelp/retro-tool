import {useQuery} from "react-query";
import api from "../api";

export const useBoard = (id: string) => {
  return useQuery(['board', id], () => api.fetchBoard(id), { enabled: id != null })
}
