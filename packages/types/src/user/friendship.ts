import type { Friendship, Profile, User } from '@prisma/client';
import { UserModelMapper, type UserProfile, type UserProfileThread } from '@messanger/types';

export interface FriendshipRequest {
  userId: string;
  friendId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'BLOCKED';
}

export interface FriendshipPublic extends Omit<Friendship, 'friendId'> {
  friend: UserProfile;
}

export interface FriendshipList extends Omit<Friendship, 'friendId'> {
  friend: UserProfileThread;
}

export namespace FriendshipModelMapper {
  export const toPublic = (friendship: Friendship & { friend: User }): FriendshipPublic => {
    return {
      ...friendship,
      friend: UserModelMapper.fromUserToUserPublic(friendship.friend),
    };
  };

  export const toList = (friendship: Friendship & { friend: User & { profile?: Profile } }): FriendshipList => {
    return {
      ...friendship,
      friend: UserModelMapper.fromUserToUserProfileThread(friendship.friend),
    };
  };
}
