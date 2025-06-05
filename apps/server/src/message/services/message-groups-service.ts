import { prismaClient } from "@messanger/prisma";
import { messageGroupsBaseSchema, messageGroupsSchema, messageSchema } from "../message-validations";
import { Message } from "@prisma/client";
import { MessageGroupsPublic, MessageGroupsRequest } from "@types/messages/message-groups";
import { MessageGroupsMessagesRequest, MessagePublic } from "@types/messages/message";



export class MessageGroupService {
    private static messageGroupRepository = prismaClient.messageGroups;
    private static messageGroupMessagesRepository = prismaClient.messageGroupMessages;
    private static groupMemberRepository = prismaClient.messageGroupMembers;
    private static messageRepository = prismaClient.message;

    static async getUserMessageGroups(userId: string): Promise<MessageGroupsPublic[]> {
        const groups = await this.messageGroupRepository.findMany({
            where: {
                isDeleted: false,
                members: {
                    some: {
                        userId: userId,
                    }
                }
            },
            include: {
                owner: true,
                members: {
                    where: { isDeleted: false },
                    include: { user: true },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return groups.map(group => MessageGroupsPublic.fromPrismaQuery(group));
    }

    static async getMessageGroupsById(groupId: string, userId: string): Promise<MessageGroupsPublic> {
        const group = await this.messageGroupRepository.findFirst({
            where: {
                id: groupId,
                isDeleted: false,
                members: {
                    some: {
                        userId: userId
                    }
                }
            },
            include: {
                owner: true,
                members: {
                    where: { isDeleted: false }, // <-- filter di sini!
                    include: {
                        user: true,
                    },
                },
            },
        });
        if (!group) {
            throw new Error("Group not found or user is not a member");
        }
        return MessageGroupsPublic.fromPrismaQuery(group);
    }

    static async getMessageGroupsPublic(groupId: string): Promise<MessageGroupsPublic> {
        const group = await this.messageGroupRepository.findFirst({
            where: {
                id: groupId,
                isPublic: true,
                isDeleted: false,
            },
            include: {
                owner: true,
                members: {
                    where: { isDeleted: false },
                    include: {
                        user: true,
                    },
                },
            },
        });
        if (!group) {
            throw new Error("Group not found");
        }
        return MessageGroupsPublic.fromPrismaQuery(group);
    }

    static async createMessageGroup(req: MessageGroupsRequest, userId: string) {
        req = messageGroupsSchema.parse(req);

        // Check if all userIds in req.members exist in the users table
        const users = await prismaClient.user.findMany({
            where: {
                id: { in: req.members },
            },
        });

        if (users.length !== req.members.length) {
            throw new Error("One or more users do not exist");
        }

        // Prepare members array for group creation (exclude duplicates)
        const uniqueMemberIds = Array.from(new Set(req.members));
        const members = uniqueMemberIds.map(userId => ({ userId }));

        const group = await this.messageGroupRepository.create({
            data: {
                ...req,
                ownerId: userId,
                members: {
                    create: members.map(member => ({
                        userId: member.userId,
                    })),
                },
            },
            include: {
                owner: true,
                members: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        return MessageGroupsPublic.fromPrismaQuery(group);
    }

    static async updateMessageGroup(groupId: string, req: Partial<MessageGroupsRequest>, userId: string): Promise<MessageGroupsPublic> {
        req = messageGroupsBaseSchema.partial().parse(req);
        const group = await this.messageGroupRepository.findFirst({
            where: {
                id: groupId,
                ownerId: userId,
            },
            include: {
                owner: true,
                members: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        if (!group) {
            throw new Error("Group not found or user is not the owner");
        }
        const updatedGroup = await this.messageGroupRepository.update({
            where: { id: groupId },
            data: {
                name: req.name ?? group.name,
                members: req.members ? {
                    create: req.members.map(userId => ({
                        userId: userId,
                    })),
                } : undefined,
            },
            include: {
                owner: true,
                members: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    include: {
                        user: true,
                    },
                },
            },
        });
        return MessageGroupsPublic.fromPrismaQuery(updatedGroup);
    }

    static async deleteMemberFromGroup(groupId: string, userId: string, memberId: string): Promise<void> {
        console.log("Deleting member from group:", groupId, userId, memberId);
        const group = await this.messageGroupRepository.findFirst({
            where: {
                id: groupId,
                ownerId: userId,
            },
        });
        if (!group) {
            throw new Error("Group not found or user is not the owner");
        }
        const member = await this.groupMemberRepository.findFirst({
            where: {
                messageGroupId: groupId,
                userId: memberId,
            },
        });
        if (!member) {
            throw new Error("Member not found in the group");
        }
        //softdelete member
        await this.groupMemberRepository.update({
            where: {
                id: member.id,
            },
            data: {
                deletedAt: new Date(),
                isDeleted: true,
            },
        });
    }
    static async deleteMessageGroup(groupId: string, userId: string): Promise<void> {
        const group = await this.messageGroupRepository.findFirst({
            where: {
                id: groupId,
                ownerId: userId,
            },
        });
        if (!group) {
            throw new Error("Group not found or user is not the owner");
        }
        await this.messageGroupRepository.update({
            where: { id: groupId },
            data: {
                deletedAt: new Date(),
                isDeleted: true,
            },
        });
    }

    static async getMessagesGroup(groupId: string, userId: string): Promise<MessagePublic[]> {
        const group = await this.messageGroupRepository.findFirst({
            where: {
                id: groupId,
                members: {
                    some: {
                        userId: userId
                    }
                }
            },
        });
        if (!group) {
            throw new Error("Group not found or user is not a member");
        }
        const messages = await this.messageGroupMessagesRepository.findMany({
            where: {
                id: groupId,
            },
            orderBy: {
                createdAt: "asc",
            },
            include: {
                message: true,
            },
        }) as unknown as Message[];

        return messages.map(msg => MessagePublic.fromMessage(msg));
    }

    static async sendMessageToGroup(req: MessageGroupsMessagesRequest, groupId: string, userId: string): Promise<MessagePublic> {
        req.message = messageSchema.parse(req.message);

        const group = await this.messageGroupRepository.findFirst({
            where: {
                id: groupId,
                members: {
                    some: {
                        userId: userId
                    }
                }
            },
            include: {
                members: true,
            },
        });
        if (!group) {
            throw new Error("Group not found or user is not a member");
        }
        const message = await this.messageRepository.create({
            data: {
                ...req.message,
                senderId: userId,
            },
        });
        const messageData = await this.messageGroupMessagesRepository.create({
            data: {
                messageId: message.id,
                messageGroupId: group.id,
            },
            include: {
                message: true,
            },
        });
        return MessagePublic.fromMessage(messageData.message);

    }
}