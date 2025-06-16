import type { ProfilePublic } from "../user/profile";
import type { UserModelMapper, UserRequest } from "../user/user";



export interface RegisterRequest extends UserRequest { }
export interface RegisterResponse extends UserModelMapper {
    profile: Omit<ProfilePublic, 'user'>;
}

export namespace RegisterResponse {
    export function fromUserAndProfile(user: UserModelMapper, profile: Omit<ProfilePublic, 'user'>): RegisterResponse {
        return {
            ...user,
            profile
        };
    }
}