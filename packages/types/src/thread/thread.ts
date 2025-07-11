import type { Conversation, Thread, User, Profile, ConversationStatus } from '@prisma/client';
import { ConversationModelMapper, UserModelMapper, type ConversationPublic, type UserProfileThread } from '@messanger/types';

export interface ThreadRequest {
  name?: string;
  creatorId?: string;
  participantIds?: string[];
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
  lastConversation?: ConversationPublic;
  createdAt: Date;
  unreadCount?: number;
  participants?: UserProfileThread[];
}

export interface ThreadConversationList {
  thread?: ThreadPublic;
  conversations: ConversationPublic[];
}

export namespace ThreadModelMapper {
  export function fromThreadToThreadPublic(thread: Thread & { creator?: User & { profile?: Profile } }): ThreadPublic {
    const { creatorId, ...rest } = thread;
    return {
      ...rest,
      creator: thread.creator ? UserModelMapper.fromUserToUserProfileThread(thread.creator) : undefined,
    };
  }

  export function fromThreadToThreadList(thread: Thread & { creator?: User & { profile?: Profile } }, lastConversation?: Conversation & { sender?: User & { profile?: Profile } }, unreadCount?: number, participants?: (User & { profile?: Profile })[]): ThreadList {
    const { creatorId, creator, ...rest } = thread;
    return {
      ...rest,
      creator: creator ? UserModelMapper.fromUserToUserProfileThread(creator) : undefined,
      // TODO : even if lastConversation is undefined, we should still return undefined for lastConversation
      lastConversation: lastConversation ? ConversationModelMapper.fromConversationToConversationPublic(lastConversation) : undefined,
      createdAt: lastConversation?.createdAt ?? new Date(),
      unreadCount,
      participants: participants?.map(UserModelMapper.fromUserToUserProfileThread),
    };
  }

  export function fromThreadToThreadConversationList(conversations?: (Conversation & { sender?: User & { profile?: Profile } } & { status?: ConversationStatus })[], thread?: Thread): ThreadConversationList {
    return {
      thread: thread ? ThreadModelMapper.fromThreadToThreadPublic(thread) : undefined,
      conversations:
        conversations?.map((conversation) => {
          const convPublic = ConversationModelMapper.fromConversationToConversationPublic(conversation);
          // Attach status if present, otherwise undefined
          return {
            ...convPublic,
            status: (conversation as Conversation & { status?: ConversationStatus }).status,
          };
        }) ?? [],
    };
  }
}
