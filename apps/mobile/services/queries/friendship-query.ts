import { useMutation, useQuery } from '@tanstack/react-query';
import { getConversationById, getConversations, postConversation, putConversation } from '@/services/apis/conversation';
import { ConversationPublic, ConversationRequest, FriendshipRequest, QueryParamsData } from '@messanger/types';
import { queryClient } from '.';
import { decryptionData } from '@utils/crypto';
import { getDataFromLocalStorage } from '@/utils/local-storage';
import { findFriendship, getFriendshipById, getFriendships, postFriendship, putFriendship } from '../apis/friendship';

export const friendshipKey = {
  all: ['friendship'] as const,
  detail: (id: string) => ['friendship', id] as const,
};

export function useFriendshipQuery(queryParams?: QueryParamsData) {
  return useQuery({
    queryKey: friendshipKey.all,
    queryFn: async () => {
      const data = await getFriendships(queryParams);
      return data;
    },
    select: (data) => (Array.isArray(data) ? data : data?.data?.items ?? []),
    placeholderData: () => queryClient.getQueryData(friendshipKey.all),
    enabled: !queryParams?.search || queryParams.search.length > 0,
  });
}

export function useFriendshipDetailQuery(friendshipId: string) {
  return useQuery({
    queryKey: friendshipKey.detail(friendshipId),
    queryFn: () => getFriendshipById(friendshipId),
    placeholderData: () => queryClient.getQueryData(friendshipKey.detail(friendshipId)),
    //select: (data) => (Array.isArray(data) ? data : data?.data?.items ?? []),
    enabled: !!friendshipId,
  });
}

export function useFindFriendshipQuery(queryParams: QueryParamsData) {
  return useQuery({
    queryKey: friendshipKey.all,
    queryFn: () => findFriendship(queryParams),
    select: (data) => (Array.isArray(data) ? data : data?.data?.items ?? []),
    placeholderData: () => queryClient.getQueryData(friendshipKey.all),
    retry: false,
    enabled: !!queryParams.search,
  });
}

export function useMutationFriendshipQuery(friendshipId: string) {
  return useMutation({
    onMutate: async (newFriendship) => {
      await queryClient.cancelQueries({ queryKey: friendshipKey.detail(friendshipId) });
      const previousFriendship = queryClient.getQueryData(friendshipKey.detail(friendshipId));
      console.log('Previous conversation data:', previousFriendship);
      queryClient.setQueryData(friendshipKey.detail(friendshipId), (old: any) => {
        if (old && old.data && Array.isArray(old.data.items)) {
          return {
            ...old,
            data: {
              ...old.data,
              items: [...old.data.items, newFriendship],
            },
          };
        }
        return {
          data: { items: [newFriendship] },
          meta: {},
          message: '',
          success: true,
        };
      });
      return { previousFriendship };
    },
    mutationFn: (newFriendship: FriendshipRequest) => postFriendship(newFriendship),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: friendshipKey.detail(friendshipId) });
    },
  });
}

export function useEditFriendshipMutation(friendshipId: string) {
  return useMutation({
    mutationFn: (req: FriendshipRequest) => putFriendship(friendshipId, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendshipKey.detail(friendshipId) });
    },
  });
}
