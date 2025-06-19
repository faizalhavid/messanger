import type { User, Profile } from '@prisma/client';
import { ProfileModelMapper, type ImageType, type ProfilePublic } from 'packages/types';

export type UserRequest = {
  username: string;
  email: string;
  password: string;
};


export interface UserProfileRequest extends Omit<UserProfileThread, 'avatar' | 'id'> {
  avatar: ImageType,
  username: string;
  // bio?: string;
}


export interface UserPublic extends Omit<User, 'password' | 'lastLogin' | 'token'> { }

export type UserProfileThread = {
  id: string;
  username: string;
  avatar?: string | null;
};

export interface UserProfile extends UserPublic {
  profile?: ProfilePublic | null;
};



export namespace UserModelMapper {
  export function fromUserToUserPublic(user: User): UserPublic {
    const { id, username, email, createdAt, updatedAt, deletedAt, isDeleted, isActive } = user;
    return { id, username, email, createdAt, updatedAt, deletedAt, isDeleted, isActive };
  }
  export function fromUserToUserProfileThread(user: User & { profile?: Profile }): UserProfileThread {
    return {
      id: user.id,
      username: user.username,
      avatar: user.profile?.avatar ?? null,
    };
  }

  export function fromUserToUserPublicWithProfile(user: User & { profile?: Profile }): { users: UserPublic, profile: ProfilePublic | undefined } {
    return {
      users: fromUserToUserPublic(user),
      profile: user.profile ? ProfileModelMapper.fromProfile(user.profile) : undefined,
    };
  }

  export function fromUserToUserProfile(user: User & { profile: Profile }): UserProfile {
    return {
      ...fromUserToUserPublic(user),
      profile: user.profile ? ProfileModelMapper.fromProfile(user.profile) : undefined,
    };
  }

}