import { QueryParamsData, ThreadRequest } from '@messanger/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getConversationsByThreadId, getThreads, postThread } from '../apis/thread';
import { queryClient } from '.';

export const threadKeys = {
  all: ['thread'] as const,
  detail: (id: string) => ['thread', id] as const,
};

export function useThreadQuery(queryParams?: QueryParamsData) {
  return useQuery({
    queryKey: threadKeys.all,
    queryFn: () => getThreads(queryParams),
    placeholderData: () => queryClient.getQueryData(threadKeys.all),
    enabled: !queryParams?.search || queryParams.search.length > 0,
    select: (data) => (Array.isArray(data) ? data : data?.data?.items ?? []),
  });
}

export function useThreadDetailQuery(threadId: string, conversationQueryParams?: QueryParamsData) {
  return useQuery({
    queryKey: threadKeys.detail(threadId),
    queryFn: () => getConversationsByThreadId(threadId, conversationQueryParams),
    placeholderData: () => queryClient.getQueryData(threadKeys.detail(threadId)),
    enabled: !!threadId,
  });
}

export function useMutationThreadQuery(previousThreadId: string) {
  return useMutation({
    onMutate: async (newThread) => {
      await queryClient.cancelQueries({ queryKey: threadKeys.detail(previousThreadId) });
      const previousThread = queryClient.getQueryData(threadKeys.detail(previousThreadId));
      console.log('Previous thread data:', previousThread);
      queryClient.setQueryData(threadKeys.detail(previousThreadId), (old: any) => {
        if (old && old.data && Array.isArray(old.data.items)) {
          return {
            ...old,
            data: {
              ...old.data,
              items: [...old.data.items, newThread],
            },
          };
        }
        return {
          data: { items: [newThread] },
          meta: {},
          message: '',
          success: true,
        };
      });
      return { previousThread };
    },
    mutationFn: (newThread: ThreadRequest) => postThread(newThread),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: threadKeys.detail(previousThreadId) });
    },
  });
}

export function useUpdateThreadQuery(threadId: string) {
  return useMutation({
    mutationFn: (req: ThreadRequest) => postThread(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: threadKeys.detail(threadId) });
    },
  });
}
