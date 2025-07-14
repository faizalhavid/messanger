import type { User, Profile } from '@prisma/client';
import { ProfileModelMapper, type ProfilePublic } from './profile';
import type { ImageType } from '../file';

export type UserRequest = {
  username: string;
  email: string;
  password: string;
};

export interface UserProfileRequest extends Omit<UserProfileThread, 'avatar' | 'id'> {
  avatar: ImageType;
  username: string;
  description?: string;
  // bio?: string;
}

export interface UserPublic extends Omit<User, 'password' | 'lastLogin' | 'token'> { }

export type UserProfileThread = {
  id: string;
  username: string;
  avatar?: string | null;
  description?: string | null;
};

export interface UserProfile extends UserPublic {
  profile?: ProfilePublic | null;
}

export namespace UserModelMapper {
  export function fromUserToUserPublic(user: User): UserPublic {
    const { password, lastLogin, token, ...userPublic } = user;
    return userPublic;
  }
  export function fromUserToUserProfileThread(user: User & { profile?: Profile }): UserProfileThread {
    return {
      id: user.id,
      username: user.username,
      avatar: user.profile?.avatar ?? null,
      description: user.profile?.description ?? null,
    };
  }

  export function fromUserToUserPublicWithProfile(user: User & { profile?: Profile }): { users: UserPublic; profile: ProfilePublic | undefined } {
    return {
      users: fromUserToUserPublic(user),
      profile: user.profile ? ProfileModelMapper.fromProfile(user.profile) : undefined,
    };
  }

  export function fromUserToUserProfile(user: User & { profile: Profile }): UserProfile {
    const userProfile = fromUserToUserPublic(user);
    return {
      ...userProfile,
      profile: user.profile ? ProfileModelMapper.fromProfile(user.profile) : undefined,
    };
  }
}
