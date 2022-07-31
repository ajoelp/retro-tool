import { ActionItem } from '@prisma/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '../api';

interface ActionItemsList {
  actionItems: ActionItem[];
}

export function useActionItems(boardId?: string) {
  return useQuery(
    ['actionItems', { boardId }],
    async () => {
      const { data } = await apiClient.get<ActionItemsList>(`/boards/${boardId}/action-items`);
      return data.actionItems;
    },
    { enabled: boardId != null },
  );
}

export function useCreateActionItem(boardId: string) {
  return useMutation((value: string) => apiClient.post(`/boards/${boardId}/action-items`, { value }));
}

export function useUpdateActionItem(boardId: string, actionItemId: string) {
  return useMutation((data: Partial<ActionItem>) =>
    apiClient.patch(`/boards/${boardId}/action-items/${actionItemId}`, data),
  );
}

export function useDeleteActionItem(boardId: string, actionItemId: string) {
  return useMutation(() => apiClient.delete(`/boards/${boardId}/action-items/${actionItemId}`));
}

export function useImportActionItems(boardId: string) {
  return useMutation((sourceBoardId: string) =>
    apiClient.post(`/boards/${boardId}/action-items-import`, { sourceBoardId }),
  );
}
