import { prismaClient } from "@messanger/prisma";
import { groupMessageSchema, MessageGroupsMessagesPublic } from "@messanger/types";



export class GroupMessagesService {
    private static messageGroupRepository = prismaClient.messageGroups;
    private static messageGroupMessagesRepository = prismaClient.messageGroupMessages;
    private static groupMemberRepository = prismaClient.messageGroupMembers;
    private static messageRepository = prismaClient.message;

    static async getGroupMessages(groupId: string, userId: string): Promise<MessageGroupsMessagesPublic[]> {
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
                messages: {
                    where: {
                        isDeletedByOwner: false,
                        // message: {
                        //     isDeletedBySender: false,
                        //     isDeletedByReceiver: false
                        // }
                    },
                    orderBy: { createdAt: "asc" },
                    include: {
                        message: true,
                    }
                }
            }
        });

        if (!group) {
            throw new Error("Group not found or you do not have access to it.");
        }

        return group.messages.map(groupMessage =>
            MessageGroupsMessagesPublic.fromMessageGroupMessages(groupMessage)
        );
    }

    static async sendGroupMessage(
        groupId: string,
        userId: string,
        req: { content: string }
    ): Promise<MessageGroupsMessagesPublic> {
        req = groupMessageSchema.parse(req);
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
                    where: { isDeleted: false },
                    include: { user: true },
                },
            },
        });

        if (!group) {
            throw new Error("Group not found or you do not have access to it.");
        }

        const bulkMessage = await this.messageRepository.create({
            data: {
                content: req.content,
                senderId: userId,
                receiverId: group.owner.id
            },
        });

        const groupMessage = await this.messageGroupMessagesRepository.create({
            data: {
                messageGroupId: groupId,
                messageId: bulkMessage.id,
            },
            include: {
                message: {
                    include: {
                        sender: true
                    }
                },

            }
        });


        return MessageGroupsMessagesPublic.fromMessageGroupMessages(groupMessage);
    }

    static async deleteGroupMessage(
        groupId: string,
        messageId: string,
        userId: string
    ): Promise<void> {
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
                members: true,
            },
        });

        if (!group) {
            throw new Error("Group not found or you do not have access to it.");
        }

        const message = await this.messageRepository.findUnique({
            where: { id: messageId },
            include: { sender: true, receiver: true }
        });

        if (!message || (message.senderId !== userId && message.receiverId !== userId)) {
            throw new Error("Message not found or you do not have permission to delete it.");
        }

        await this.messageRepository.update({
            where: { id: messageId },
            data: { isDeletedBySender: true }
        });
    }

    static async deleteGroupMessagesByOwnerGroup(
        groupId: string,
        userId: string
    ): Promise<void> {
        const group = await this.messageGroupRepository.findFirst({
            where: {
                id: groupId,
                ownerId: userId,
                isDeleted: false
            }
        });

        if (!group) {
            throw new Error("Group not found or you do not have permission to delete messages.");
        }

        await this.messageGroupMessagesRepository.updateMany({
            data: { isDeletedByOwner: true },
            where: { messageGroupId: groupId }
        });
    }
}