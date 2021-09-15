import { User } from '@prisma/client';
import { useQuery } from 'react-query';

export function useActiveUsers(boardId: string) {
  const { data } = useQuery<User[]>(['activeUsers', { boardId }], () => [])
  return data
}
