import type { Conversation, Thread, User, Profile, ConversationStatus, ThreadParticipant } from '@prisma/client';
import { ConversationModelMapper, ThreadParticipantModelMapper, UserModelMapper, type ConversationPublic, type ThreadParticipantPublic, type UserProfileThread } from '@messanger/types';

export enum ThreadTypeEnum {
  PRIVATE,
  GROUP,
}

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
  participants?: UserProfileThread[];
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

  export function fromThreadToThreadPublic(
    thread: Thread & {
      creator?: User & { profile?: Profile },
      participants?: (ThreadParticipant & { profile?: Profile })[]
    }
  ): ThreadPublic {
    const { creatorId, ...rest } = thread;
    return {
      ...rest,
      creator: thread.creator ? UserModelMapper.fromUserToUserProfileThread(thread.creator) : undefined,
      participants: thread.participants
        ?.map(ThreadParticipantModelMapper.fromThreadParticipantToUserProfileThread)
        .filter((p): p is UserProfileThread => p !== undefined),

    };
  }

  export function fromThreadToThreadList(
    thread: Thread & {
      creator?: User & { profile?: Profile };
      participants?: (ThreadParticipant & { profile?: Profile })[];
    },
    lastConversation?: Conversation & { sender?: User & { profile?: Profile } },
    unreadCount?: number
  ): ThreadList {
    const { creatorId, creator, participants, ...rest } = thread;
    return {
      ...rest,
      creator: creator ? UserModelMapper.fromUserToUserProfileThread(creator) : undefined,
      lastConversation: lastConversation
        ? ConversationModelMapper.fromConversationToConversationPublic(lastConversation)
        : undefined,
      createdAt: lastConversation?.createdAt ?? new Date(),
      unreadCount,
      participants: thread.participants
        ?.map(ThreadParticipantModelMapper.fromThreadParticipantToUserProfileThread)
        .filter((p): p is UserProfileThread => p !== undefined),
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
