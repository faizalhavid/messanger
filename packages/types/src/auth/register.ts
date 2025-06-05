import type { ProfilePublic } from "../user/profile";
import type { UserPublic, UserRequest } from "../user/user";



export interface RegisterRequest extends UserRequest { }
export interface RegisterResponse extends UserPublic {
    profile: Omit<ProfilePublic, 'user'>;
}

export namespace RegisterResponse {
    export function fromUserAndProfile(user: UserPublic, profile: Omit<ProfilePublic, 'user'>): RegisterResponse {
        return {
            ...user,
            profile
        };
    }
}