import type { User } from '@prisma/client';

export type UserRequest = {
  username: string;
  email: string;
  password: string;
};

export interface UserPublic extends Omit<User, 'password' | 'lastLogin' | 'token'> {}

export namespace UserPublic {
  export function fromUser(user: User): UserPublic {
    const { id, username, email, createdAt, updatedAt, deletedAt, isDeleted, isActive } = user;
    return { id, username, email, createdAt, updatedAt, deletedAt, isDeleted, isActive };
  }
}

export type UserProfileThread = {
  id: string;
  username: string;
  avatar?: string | null;
};
