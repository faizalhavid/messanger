import type { Thread, ThreadParticipant, User } from '@prisma/client';
import { ThreadModelMapper, type ThreadPublic } from './thread';
import type { UserProfileThread } from 'packages/types';

export interface ThreadParticipantsRequest {
  threadId: string;
  userId: string;
}

export interface ThreadParticipantPublic extends Omit<ThreadParticipant, 'userId' | 'threadId'> {
  user?: UserProfileThread;
  thread: ThreadPublic;
}

export interface ThreadParticipantList extends Omit<ThreadParticipantPublic, 'user'> {
  totalParticipants: number;
  participants: UserProfileThread[];
}

export namespace ThreadParticipantModelMapper {
  export function fromThreadParticipantToThreadParticipantPublic(participant: ThreadParticipant & { user?: User; thread: Thread }): ThreadParticipantPublic {
    const { userId, threadId, ...rest } = participant;

    return {
      ...rest,
      user: participant.user ? { ...participant.user } : undefined,
      thread: ThreadModelMapper.fromThreadToThreadPublic(participant.thread),
    };
  }

  export function fromThreadParticipantToThreadParticipantList(participant: ThreadParticipant & { user?: User; thread: Thread }, participants: UserProfileThread[]): ThreadParticipantList {
    const { userId, threadId, ...rest } = participant;
    return {
      ...rest,
      totalParticipants: participants.length,
      participants,
    };
  }
}
