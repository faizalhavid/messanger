import { useMutation, useQuery } from '@tanstack/react-query';
import { getConversationById, getConversations, postConversation, putConversation } from '@/services/apis/conversation';
import { ConversationPublic, ConversationRequest, PaginatedData, PaginatedResponse, QueryParamsData } from '@messanger/types';
import { queryClient } from '.';
import { decryptionData } from '@utils/crypto';
import { getDataFromLocalStorage } from '@/utils/local-storage';

export const conversationKeys = {
  all: (threadId: string) => ['conversation', threadId] as const,
  detail: (id: string, threadId?: string) => ['conversation', id, threadId] as const,
};

export function useConversationsQuery(threadId: string, privateKey: string, queryParams?: QueryParamsData) {
  return useQuery({
    queryKey: conversationKeys.all(threadId),
    queryFn: async () => {
      const data = await getConversations(threadId, queryParams);
      console.log("response", data);
      if (data?.data?.items) {
        const decryptedItems = await Promise.all(
          data.data.items.map(async (item: ConversationPublic) => {
            if (item.content) {
              try {
                const decryptedContent = await decryptionData(privateKey, item.content);
                return { ...item, content: decryptedContent } as ConversationPublic;
              } catch (e) {
                console.error(`error ${e}`)
                return item;
              }
            }
            return item;
          })
        );
        return { ...data, data: { ...data.data, items: decryptedItems }, } as PaginatedResponse<ConversationPublic>;
      }
      return data;
    },
    select: (data) => (Array.isArray(data) ? data : data?.data ?? undefined),
    placeholderData: () => queryClient.getQueryData(conversationKeys.all(threadId)),
    enabled: !!threadId && !!privateKey,
  });
}

export function useConversationDetailQuery(conversationId: string, threadId: string) {
  return useQuery({
    queryKey: conversationKeys.detail(threadId, conversationId),
    queryFn: () => getConversationById(conversationId, threadId),
    placeholderData: () => queryClient.getQueryData(conversationKeys.detail(threadId ?? '')),
    //select: (data) => (Array.isArray(data) ? data : data?.data?.items ?? []),
    enabled: !!conversationId && !!threadId,
  });
}

export function useMutationConversationQuery(threadId: string) {
  return useMutation({
    onMutate: async (newConversation) => {
      await queryClient.cancelQueries({ queryKey: conversationKeys.detail(threadId) });
      const previousConversation = queryClient.getQueryData(conversationKeys.detail(threadId));
      console.log('Previous conversation data:', previousConversation);
      queryClient.setQueryData(conversationKeys.detail(threadId), (old: any) => {
        if (old && old.data && Array.isArray(old.data.items)) {
          return {
            ...old,
            data: {
              ...old.data,
              items: [...old.data.items, newConversation],
            },
          };
        }
        return {
          data: { items: [newConversation] },
          meta: {},
          message: '',
          success: true,
        };
      });
      return { previousConversation };
    },
    mutationFn: (newConversation: ConversationRequest) => postConversation(threadId, newConversation),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.detail(threadId) });
    },
  });
}

export function useEditConversationMutation(conversationId: string, threadId: string) {
  return useMutation({
    mutationFn: (req: ConversationRequest) => putConversation(conversationId, threadId, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.detail(conversationId, threadId) });
    },
  });
}
