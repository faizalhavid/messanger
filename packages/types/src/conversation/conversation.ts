import type { Conversation, ConversationStatus, Profile, User } from '@prisma/client';
import type { ConversationOverviewStatus, ConversationStatusPublic } from 'packages/types';

export type ConversationRequest = {
  content: string;
  senderId: string;
  threadId: string;
};

export interface ConversationUserProfile {
  id: string;
  username: string;
  avatar?: string | null;
}

export interface ConversationPublic extends Omit<Conversation, 'updatedAt' | 'threadId' | 'senderId'> {
  // sender: ConversationUserProfile;
  sender?: ConversationUserProfile;
  status?: ConversationStatusPublic;
}

export namespace ConversationModelMapper {
  export function fromUserToConversationUserProfile(user?: User & { profile?: Profile }): ConversationUserProfile {
    return {
      id: user?.id ?? '',
      username: user?.username ?? '',
      avatar: user?.profile?.avatar ?? null,
    };
  }

  export function fromConversationToConversationPublic(conversation: Conversation & { sender?: User & { profile?: Profile } }, status?: ConversationStatusPublic): ConversationPublic {
    const { threadId, senderId, ...rest } = conversation;
    return {
      ...rest,
      sender: conversation.sender ? fromUserToConversationUserProfile(conversation.sender) : undefined,
      status,
    };
  }
}
