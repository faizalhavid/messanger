import type { UserPublic } from "./user/user";

export interface HonoContext {
    token: string | null;
    authenticatedUser: UserPublic;
}