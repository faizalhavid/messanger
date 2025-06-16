import { prismaClient } from "@messanger/prisma";
import { UserModelMapper, UserProfileRequest, UserProfileSchema, UserProfileThread } from "@messanger/types";
import { HTTPException } from "hono/http-exception";
import { tokenSchema } from "@messanger/types";

export class UserService {
    private static userRepository = prismaClient.user;
    private static userProfileRepository = prismaClient.profile;
    private static PENDING_TIME_ROLLBACK_DELETED_USER_STATUS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    static async getUserProfile(userId: string): Promise<UserProfileThread> {
        const user = await this.userRepository.findUnique({ where: { id: userId } });
        if (!user) throw new HTTPException(404, { message: "User not found" });
        return UserModelMapper.fromUserToUserProfile(user);
    }

    static async getUserByToken(token: string): Promise<UserProfileThread> {
        const validatedToken = tokenSchema.parse(token);
        const user = await this.userRepository.findFirst({ where: { token: validatedToken } });
        if (!user) throw new HTTPException(404, { message: "User not found" });
        return UserModelMapper.fromUserToUserProfile(user);
    }

    static async updateUserProfile(userId: string, req: UserProfileRequest): Promise<UserProfileThread> {
        const validatedData = UserProfileSchema.parse(req);
        const user = await this.userRepository.findUnique({ where: { id: userId } });
        if (!user) throw new HTTPException(404, { message: "User not found" });
        const updatedUser = await this.userRepository.update({
            where: { id: userId },
            data: {
                username: validatedData.username,
                profile: {
                    update: {
                        avatar: validatedData.avatar?.url,
                    }
                }
            }
        });

        return UserModelMapper.fromUserToUserProfile(updatedUser);
    }

    static async updateActivateUser(userId: string, status: boolean): Promise<void> {
        const user = await this.userRepository.findUnique({ where: { id: userId } });
        if (!user) throw new HTTPException(404, { message: "User not found" });
        await this.userRepository.update({
            where: { id: userId },
            data: {
                isActive: status,
            }
        });
    }

    static async updateDeleteUserStatus(userId: string, status: boolean): Promise<void> {
        const user = await this.userRepository.findUnique({ where: { id: userId } });
        if (!user) throw new HTTPException(404, { message: "User not found" });
        if (user.deletedAt && !status) {
            throw new HTTPException(400, { message: "User is already deleted" });
        }
        if (!user.deletedAt && status) {
            throw new HTTPException(400, { message: "User is not deleted" });
        }

        if (user.deletedAt && (user.deletedAt > new Date(Date.now() - this.PENDING_TIME_ROLLBACK_DELETED_USER_STATUS))) {
            throw new HTTPException(400, { message: "User cannot be deleted within 24 hours of deletion" });
        }
        await this.userRepository.update({
            where: { id: userId },
            data: {
                isDeleted: status,
                deletedAt: status ? new Date() : null,
            }
        });
    }

}