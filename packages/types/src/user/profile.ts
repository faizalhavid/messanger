import type { User, Profile, Biodata } from "@prisma/client";
import { BiodataPublic } from "./bio";
import { UserPublic } from "./user";

export interface ProfileRequest {
    firstName: string;
    lastName: string;
    avatar?: string;
}

export interface ProfilePublic extends Omit<Profile, 'updatedAt' | 'userId' | 'bioId'> {
    user: Omit<UserPublic, 'createdAt' | 'updatedAt'>;
    bio?: Omit<BiodataPublic, 'createdAt' | 'updatedAt'>;
}

export namespace ProfilePublic {
    export function fromProfile(profile: Profile & { user: User, bio?: Biodata }): ProfilePublic {
        const {
            userId,
            bioId,
            updatedAt,
            // isDeleted,
            // deletedAt
            ...rest
        } = profile;
        return {
            ...rest,
            user: UserPublic.fromUser(profile.user),
            bio: profile.bio ? BiodataPublic.fromBiodata(profile.bio) : undefined
        };
    }
}