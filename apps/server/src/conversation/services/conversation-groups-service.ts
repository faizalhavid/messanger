import { prismaClient } from "@messanger/prisma";
import { Conversation } from "@prisma/client";
import { ConversationGroupsPublic, ConversationGroupRequest, ConversationPublic, ConversationGroupsMessagesRequest, messageGroupsSchema, messageGroupsBaseSchema, messageSchema } from "@messanger/types";



export class ConversationGroupService {
    private static conversationGroupRepository = prismaClient.conversationGroup;
    private static conversationGroupMessagesRepository = prismaClient.conversationGroupMessages;
    private static conversationGroupMembersRepository = prismaClient.conversationGroupMembers;
    private static conversationRepository = prismaClient.conversation;

    static async getUserMessageGroups(userId: string): Promise<ConversationGroupsPublic[]> {
        const groups = await this.conversationGroupRepository.findMany({
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
        return groups.map(group => ConversationGroupsPublic.fromPrismaToConversationGroupPublic(group));
    }

    static async getMessageGroupsById(groupId: string, userId: string): Promise<ConversationGroupsPublic> {
        const group = await this.conversationGroupRepository.findFirst({
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
        return ConversationGroupsPublic.fromPrismaToConversationGroupPublic(group);
    }

    static async getMessageGroupsPublic(groupId: string): Promise<ConversationGroupsPublic> {
        const group = await this.conversationGroupRepository.findFirst({
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
        return ConversationGroupsPublic.fromPrismaToConversationGroupPublic(group);
    }

    static async createMessageGroup(req: ConversationGroupRequest, userId: string) {
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

        const group = await this.conversationGroupRepository.create({
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

        return ConversationGroupsPublic.fromPrismaToConversationGroupPublic(group);
    }

    static async updateMessageGroup(groupId: string, req: Partial<ConversationGroupRequest>, userId: string): Promise<ConversationGroupsPublic> {
        req = messageGroupsBaseSchema.partial().parse(req);
        const group = await this.conversationGroupRepository.findFirst({
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
        const updatedGroup = await this.conversationGroupRepository.update({
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
        return ConversationGroupsPublic.fromPrismaToConversationGroupPublic(updatedGroup);
    }

    static async deleteMemberFromGroup(groupId: string, userId: string, memberId: string): Promise<void> {
        console.log("Deleting member from group:", groupId, userId, memberId);
        const group = await this.conversationGroupRepository.findFirst({
            where: {
                id: groupId,
                ownerId: userId,
            },
        });
        if (!group) {
            throw new Error("Group not found or user is not the owner");
        }
        const member = await this.conversationGroupMembersRepository.findFirst({
            where: {
                groupId: groupId,
                userId: memberId,
            },
        });
        if (!member) {
            throw new Error("Member not found in the group");
        }
        //softdelete member
        await this.conversationGroupMembersRepository.update({
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
        const group = await this.conversationGroupRepository.findFirst({
            where: {
                id: groupId,
                ownerId: userId,
            },
        });
        if (!group) {
            throw new Error("Group not found or user is not the owner");
        }
        await this.conversationGroupRepository.update({
            where: { id: groupId },
            data: {
                deletedAt: new Date(),
                isDeleted: true,
            },
        });
    }

    static async getMessagesGroup(groupId: string, userId: string): Promise<ConversationPublic[]> {
        const group = await this.conversationGroupRepository.findFirst({
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
        const messages = await this.conversationGroupMessagesRepository.findMany({
            where: {
                groupId: groupId,
                conversation: {
                    isDeletedBySender: false,
                    isDeletedByReceiver: false,
                },
            },
            orderBy: {
                createdAt: "asc",
            },
            include: {
                conversation: {
                    include: {
                        sender: { include: { profile: { include: { user: true } } } },
                        receiver: { include: { profile: { include: { user: true } } } },
                    },
                }
            },
        });

        return messages.map(msg => ConversationPublic.fromConversationToConversationPublic({
            ...msg.conversation,
            sender: msg.conversation.sender.profile!,
            receiver: msg.conversation.receiver.profile!,
        }));
    }

    static async sendMessageToGroup(req: ConversationGroupsMessagesRequest, groupId: string, userId: string): Promise<ConversationPublic> {
        req.message = messageSchema.parse(req.message);

        const group = await this.conversationGroupRepository.findFirst({
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
        const message = await this.conversationRepository.create({
            data: {
                ...req.message,
                senderId: userId,
            },
        });
        const messageData = await this.conversationGroupMessagesRepository.create({
            data: {
                conversationId: message.id,
                groupId: group.id,
            },
            include: {
                conversation: {
                    include: {
                        sender: { include: { profile: { include: { user: true } } } },
                        receiver: { include: { profile: { include: { user: true } } } },
                    },
                },
            },
        });
        return ConversationPublic.fromConversationToConversationPublic({
            ...messageData.conversation,
            sender: messageData.conversation.sender.profile!,
            receiver: messageData.conversation.receiver.profile!,
        });

    }
}