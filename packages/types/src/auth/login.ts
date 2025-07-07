import type { UserModelMapper, UserPublic } from '../user/user';

export type LoginRequest = { password: string } & ({ email: string; username?: never } | { username: string; email?: never });

export interface LoginResponse {
  // Todo Create a Table for Tokens and then use that here
  // token: TokenPublic;
  privateKey: string;
  token: string;
  user: UserPublic;
}
