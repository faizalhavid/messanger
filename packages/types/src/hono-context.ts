import type { UserModelMapper } from "./user/user";

export interface HonoContext {
    token: string | null;
    authenticatedUser: UserModelMapper;
}