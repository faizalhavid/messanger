import type { ProfileModelMapper } from "../user/profile";
import type { UserModelMapper, UserRequest } from "../user/user";



export interface RegisterRequest extends UserRequest { }
export interface RegisterResponse extends UserModelMapper {
    profile: Omit<ProfileModelMapper, 'user'>;
}

export namespace RegisterResponse {
    export function fromUserAndProfile(user: UserModelMapper, profile: Omit<ProfileModelMapper, 'user'>): RegisterResponse {
        return {
            ...user,
            profile
        };
    }
}