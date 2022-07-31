import { User } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api';

export function useActiveUsers(boardId: string) {
  const { data } = useQuery<User[]>(['activeUsers', { boardId }], () => []);
  return data;
}

export function useListUsers() {
  const { data, isLoading } = useQuery<User[]>(['users'], async () => {
    const response = await apiClient.get('/users');
    return response?.data?.users;
  });
  return {
    users: data,
    usersLoading: isLoading,
  };
}
