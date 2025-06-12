import { useMutation, useQuery } from '@tanstack/react-query';
import { getConversationById, postConversation } from '@/services/conversation';
import { conversationKeys } from '@/services/queryKeys';
import { queryClient } from '../queryClient';
import { ConversationPublic, ConversationRequest } from '@messanger/types';

export function useConversationQuery(interlocutorId?: string) {
    return useQuery({
        queryKey: conversationKeys.detail(interlocutorId ?? ''),
        queryFn: () => getConversationById(interlocutorId!),
        placeholderData: () => queryClient.getQueryData(conversationKeys.detail(interlocutorId ?? '')),
        select: (data) => Array.isArray(data) ? data : (data?.data?.items ?? []),
        enabled: !!interlocutorId,
    });
}

export function useMutationConversationQuery(interlocutorId?: string) {
    return useMutation({
        onMutate: async (newConversation) => {
            await queryClient.cancelQueries({ queryKey: ['messages', interlocutorId] });
            const previousConversation = queryClient.getQueryData(conversationKeys.detail(interlocutorId ?? ''));
            queryClient.setQueryData(conversationKeys.detail(interlocutorId ?? ''), (old: any) => {
                return [...(old || []), newConversation];
            });
            return { previousConversation };
        },
        onError: (err, newConversation, context) => {
            queryClient.setQueryData(conversationKeys.detail(interlocutorId ?? ''), context?.previousConversation);
        },
        mutationFn: (newConversation: ConversationRequest) => postConversation(newConversation),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: conversationKeys.detail(interlocutorId ?? '') });
        },
    });
}