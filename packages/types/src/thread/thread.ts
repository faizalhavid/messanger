import type { Conversation, Thread } from '@prisma/client';
import { ConversationModelMapper, type ConversationPublic, type UserProfileThread } from 'packages/types';

export interface ThreadRequest {
  creatorId?: string;
  interlocutorId?: string;
  groupId?: string;
  type: ThreadType;
}

export enum ThreadType {
  PRIVATE,
  GROUP,
}

export interface ThreadPublic extends Omit<Thread, 'creatorId'> {
  creator?: UserProfileThread;
}

export interface ThreadList extends ThreadPublic {
  lastConversation?: Omit<Conversation, 'senderId'>;
  updatedAt: Date;
  unreadCount?: number;
  participants?: UserProfileThread[];
}

export interface ThreadConversationList extends ThreadPublic {
  conversations: ConversationPublic[];
}

export namespace ThreadModelMapper {
  export function fromThreadToThreadPublic(thread: Thread & { creator?: UserProfileThread }): ThreadPublic {
    const { creatorId, ...rest } = thread;
    return {
      ...rest,
      creator: thread.creator ? { ...thread.creator } : undefined,
    };
  }

  export function fromThreadToThreadList(thread: Thread & { creator?: UserProfileThread }, lastConversation?: Omit<Conversation, 'senderId'>, unreadCount: number = 0, participants?: UserProfileThread[]): ThreadList {
    const { creatorId, ...rest } = thread;
    return {
      ...rest,
      creator: thread.creator ? { ...thread.creator } : undefined,
      lastConversation: lastConversation,
      updatedAt: lastConversation?.createdAt ?? lastConversation?.updatedAt ?? new Date(),
      unreadCount,
      participants,
    };
  }

  export function fromThreadToThreadConversationList(thread: Thread & { creator?: UserProfileThread }, conversations: (Conversation & { receiver: any })[]): ThreadConversationList {
    const { creatorId, ...rest } = thread;
    return {
      ...rest,
      creator: thread.creator ? { ...thread.creator } : undefined,
      conversations: conversations.map((conversation) => ConversationModelMapper.fromConversationToConversationPublic(conversation)),
    };
  }
}
