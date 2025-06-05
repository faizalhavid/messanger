import { HTTPException } from "hono/http-exception";
import { profileSchema } from "../user-validation";
import { prismaClient } from "@messanger/prisma";
import { UserPublic } from "@types/user/user";
import { ProfilePublic, ProfileRequest } from "@types/user/profile";

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
        const validatedProfileData = profileSchema.partial().parse(req);

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