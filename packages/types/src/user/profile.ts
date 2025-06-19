import type { User, Profile, Biodata } from "@prisma/client";
import { BiodataPublic } from "./bio";
import { UserModelMapper } from "./user";

export interface ProfileRequest {
    firstName: string;
    lastName: string;
    avatar?: string;
}

export interface ProfilePublic extends Omit<Profile, 'updatedAt' | 'bioId'> {
    bio?: Omit<BiodataPublic, 'createdAt' | 'updatedAt'>;
}

export namespace ProfileModelMapper {
    export function fromProfile(profile: Profile & { bio?: Biodata }): ProfilePublic {
        const {
            bioId,
            updatedAt,
            // isDeleted,
            // deletedAt
            ...rest
        } = profile;
        return {
            ...rest,
            bio: profile.bio ? BiodataPublic.fromBiodata(profile.bio) : undefined
        };
    }
}