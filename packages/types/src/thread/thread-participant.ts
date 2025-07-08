import type { Thread, ThreadParticipant, User, Profile } from '@prisma/client';
import { ThreadModelMapper, type ThreadPublic } from './thread';
import type { UserProfileThread } from '@messanger/types';

export interface ThreadParticipantsRequest {
  // threadId: string;
  participantId: string;
  isRead?: boolean;
  isDeleted?: boolean;
}

export interface ThreadParticipantPublic extends Omit<ThreadParticipant, 'userId' | 'threadId'> {
  user?: UserProfileThread;
  thread?: ThreadPublic;
}

// export interface ThreadParticipantList {
//   totalParticipants: number;
//   participant: Omit<ThreadParticipantPublic, "thread">;
// }

export namespace ThreadParticipantModelMapper {
  export function fromThreadParticipantToThreadParticipantPublic(participant: ThreadParticipant & { user?: User; thread?: Thread }): ThreadParticipantPublic {
    const { userId, threadId, ...rest } = participant;

    return {
      ...rest,
      user: participant.user ? { ...participant.user } : undefined,
      thread: participant.thread ? ThreadModelMapper.fromThreadToThreadPublic(participant.thread) : undefined,
    };
  }

  export function fromThreadParticipantToUserProfileThread(participant: ThreadParticipant & { user?: User & { profile?: Profile } }): UserProfileThread | undefined {
    if (!participant.user) return undefined;

    const { id, username, profile } = participant.user;
    return {
      id,
      username,
      avatar: profile?.avatar ?? null,
    };
  }

  // export function fromThreadParticipantToThreadParticipantList(
  //   participants: (ThreadParticipant & { user?: User & { profile?: Profile } })[],
  // ): ThreadParticipantList {
  //   return {
  //     totalParticipants: participants.length,
  //     participants: participants
  //       .map(participant => fromThreadParticipantToThreadParticipantPublic({ ...participant }))
  //       .filter((user): user is ThreadParticipantPublic => !!user),
  //   };
  // }
}
