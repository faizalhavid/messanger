import { HTTPException } from "hono/http-exception";
import { ProfileSchema } from "@messanger/types";
import { prismaClient } from "@messanger/prisma";
import { UserPublic } from "@messanger/types";
import { ProfilePublic, ProfileRequest } from "@messanger/types";

export class ProfileService {
    private static profileRepository = prismaClient.profile;

    static async getProfile(user: UserPublic): Promise<ProfilePublic> {
        const profile = await this.profileRepository.findFirst({
            where: { userId: user.id },
            include: { user: true }
        });
        if (!profile) throw new HTTPException(404, { message: "Profile not found" });

        return ProfilePublic.fromProfile(profile);
    }
    static async updateProfile(user: UserPublic, req: ProfileRequest): Promise<ProfilePublic> {
        const validatedProfileData = ProfileSchema.partial().parse(req);

        const updatedProfile = await this.profileRepository.update({
            where: { userId: user.id },
            data: {
                firstName: validatedProfileData.firstName,
                lastName: validatedProfileData.lastName,
                // avatar: parsedReq.avatar
            },
            include: { user: true }
        });

        return ProfilePublic.fromProfile(updatedProfile);
    }

    static async deleteProfile(user: UserPublic): Promise<void> {
        await this.profileRepository.delete({ where: { userId: user.id } });
    }

}