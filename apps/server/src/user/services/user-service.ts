import { prismaClient } from "@messanger/prisma";
import { UserModelMapper, UserProfileRequest, UserProfileSchema, UserProfile } from "@messanger/types";
import { HTTPException } from "hono/http-exception";
import { tokenSchema } from "@messanger/types";

export class UserService {
    private static userRepository = prismaClient.user;
    private static userProfileRepository = prismaClient.profile;
    private static PENDING_TIME_ROLLBACK_DELETED_USER_STATUS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    static async getUserProfile(userId: string): Promise<UserProfile> {
        const user = await this.userRepository.findUnique({ where: { id: userId }, include: { profile: true } });
        if (!user) throw new HTTPException(404, { message: "User not found" });
        return UserModelMapper.fromUserToUserProfile({
            ...user,
            profile: user.profile!
        });
    }

    static async getUserByToken(token: string): Promise<UserProfile> {
        const validatedToken = tokenSchema.parse(token);
        const user = await this.userRepository.findFirst({ where: { token: validatedToken }, include: { profile: true } });
        if (!user) throw new HTTPException(404, { message: "User not found" });
        return UserModelMapper.fromUserToUserProfile({
            ...user,
            profile: user.profile!
        });
    }

    static async updateUserProfile(userId: string, req: UserProfileRequest): Promise<UserProfile> {
        const validatedData = UserProfileSchema.parse(req);
        const user = await this.userRepository.findUnique({ where: { id: userId } });
        if (!user) throw new HTTPException(404, { message: "User not found" });
        const updatedUser = await this.userRepository.update({
            where: { id: userId },
            data: {
                username: validatedData.username,
                profile: {
                    update: {
                        firstName: validatedData.firstName,
                        lastName: validatedData.lastName,
                        avatar: validatedData.avatar?.url
                    }
                }
            },
            include: {
                profile: true,
            }
        });

        return UserModelMapper.fromUserToUserProfile({
            ...updatedUser,
            profile: updatedUser.profile!
        });
    }

    static async updateActivateStatus(userId: string, status: boolean): Promise<UserProfile> {
        const user = await this.userRepository.update({
            where: { id: userId },
            data: {
                isActive: status,
            },
            include: {
                profile: true,
            }
        });
        if (!user) throw new HTTPException(404, { message: "User not found" });
        return UserModelMapper.fromUserToUserProfile({
            ...user,
            profile: user.profile!
        });
    }
    //Todo : fix bug delay delete user status
    static async updateDeleteUserStatus(userId: string, status: boolean): Promise<UserProfile> {
        const user = await this.userRepository.findUnique({
            where: { id: userId },
            include: { profile: true }
        });
        if (!user) throw new HTTPException(404, { message: "User not found" });

        // If trying to delete and already deleted within 24h, block
        if (
            status === true &&
            user.deletedAt &&
            user.deletedAt > new Date(Date.now() - this.PENDING_TIME_ROLLBACK_DELETED_USER_STATUS)
        ) {
            throw new HTTPException(400, { message: "User cannot be deleted within 24 hours of deletion" });
        }

        // If trying to delete and already deleted, do nothing
        if (status === true && user.isDeleted) {
            return UserModelMapper.fromUserToUserProfile({
                ...user,
                profile: user.profile!
            });
        }

        // If trying to undelete, allow only if 24h passed or not deleted
        if (
            status === false &&
            user.deletedAt &&
            user.deletedAt > new Date(Date.now() - this.PENDING_TIME_ROLLBACK_DELETED_USER_STATUS)
        ) {
            throw new HTTPException(400, { message: "User cannot be restored within 24 hours of deletion" });
        }

        const updatedUser = await this.userRepository.update({
            where: { id: userId },
            data: {
                isDeleted: status,
                deletedAt: status ? new Date() : null,
            },
            include: { profile: true }
        });

        return UserModelMapper.fromUserToUserProfile({
            ...updatedUser,
            profile: updatedUser.profile!
        });
    }
}