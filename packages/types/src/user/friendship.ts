import type { Friendship, FriendshipStatusLog, Profile, User } from '@prisma/client';
import { UserModelMapper, type UserProfile, type UserProfileThread } from '@messanger/types';

export enum FriendshipStatusEnum {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  BLOCKED = 'BLOCKED',
  DECLINED = 'DECLINED',
}

export const FriendshipColorLabel: Record<FriendshipStatusEnum, string> = {
  [FriendshipStatusEnum.ACCEPTED]: "green",
  [FriendshipStatusEnum.DECLINED]: "red",
  [FriendshipStatusEnum.BLOCKED]: "gray",
  [FriendshipStatusEnum.PENDING]: "yellow",
};

export interface FriendshipRequest {
  userId: string;
  friendId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'BLOCKED';
}

export interface FriendshipPublic extends Omit<Friendship, 'friendId'> {
  friend: UserProfile;
}

export interface FriendshipStatusPublic extends Omit<FriendshipStatusLog, 'friendshipId' | 'friendship'> { }

export interface FriendshipList extends Omit<Friendship, 'friendId' | 'currentStatus'> {
  friend: UserProfileThread;
  currentStatus?: Omit<FriendshipStatusPublic, 'friendshipId' | 'friendship'> | null | undefined;
}

export namespace FriendshipModelMapper {
  export const toPublic = (friendship: Friendship & { friend: User }): FriendshipPublic => {
    return {
      ...friendship,
      friend: UserModelMapper.fromUserToUserPublic(friendship.friend),
    };
  };

  export const toList = (friendship: Friendship & { friend: User & { profile?: Profile } } & { statusLogs: FriendshipStatusLog }): FriendshipList => {
    return {
      ...friendship,
      friend: UserModelMapper.fromUserToUserProfileThread(friendship.friend),
      currentStatus: {
        ...friendship.statusLogs,
      },
    };
  };
}
