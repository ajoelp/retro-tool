import { Board } from '.prisma/client';
import { useQuery } from 'react-query';
import { apiClient } from '../api';

export const useInvite = (inviteCode: string) => {
  return useQuery(
    ['inviteCode', inviteCode],
    async (): Promise<Board> => {
      const { data } = await apiClient.post(`/invites/${inviteCode}`);
      return data.board;
    },
    { retry: 0 },
  );
};
