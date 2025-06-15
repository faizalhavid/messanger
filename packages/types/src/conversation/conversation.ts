import type { Conversation, Profile, User } from '@prisma/client';

export type ConversationRequest = {
  content: string;
  receiverId: string;
};

export interface ConversationUserProfile {
  id: string;
  username: string;
  avatar?: string | null;
}

export interface ConversationPublic extends Omit<Conversation, 'updatedAt' | 'threadId'> {
  // sender: ConversationUserProfile;
  sender: ConversationUserProfile;
}

export namespace ConversationModelMapper {
  export function fromUserToConversationUserProfile(user: User & { profile?: Profile }): ConversationUserProfile {
    return {
      id: user.id,
      username: user.username,
      avatar: user.profile?.avatar ?? null,
    };
  }

  export function fromConversationToConversationPublic(conversation: Conversation & { receiver: User }): ConversationPublic {
    const { threadId, updatedAt, ...rest } = conversation;
    return {
      ...rest,
      sender: fromUserToConversationUserProfile(conversation.receiver),
    };
  }
}
