import { useMutation, useQuery } from '@tanstack/react-query';
import { getConversationById, postConversation } from '@/services/conversation';
import { conversationKeys } from '@/services/queryKeys';
import { ConversationRequest } from '@messanger/types';

export function useConversationQuery(interlocutorId?: string) {
    return useQuery({
        queryKey: conversationKeys.detail(interlocutorId ?? ''),
        queryFn: () => getConversationById(interlocutorId!),
        enabled: !!interlocutorId,
    });
}

export function useMutationConversationQuery() {
    return useMutation({
        mutationFn: postConversation,
    });
}