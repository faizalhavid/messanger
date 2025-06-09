import { prismaClient } from "@messanger/prisma";
import { groupMessageSchema, ConversationGroupsMessagesPublic } from "@messanger/types";



export class ConversationGroupMessagesService {
    private static conversationGroupRepository = prismaClient.conversationGroup;
    private static conversationGroupMessagesRepository = prismaClient.conversationGroupMessages;
    private static conversationGroupMemberRepository = prismaClient.conversationGroupMembers;
    private static conversationRepository = prismaClient.conversation;

    static async getGroupMessages(groupId: string, userId: string): Promise<ConversationGroupsMessagesPublic[]> {
        const group = await this.conversationGroupRepository.findFirst({
            where: {
                id: groupId,
                isDeleted: false,
                members: {
                    some: {
                        userId: userId
                    }
                },
                conversations: {
                    some: {
                        isDeletedByOwner: false,
                        conversation: {
                            isDeletedBySender: false,
                            isDeletedByReceiver: false
                        }
                    },
                },
            },
            orderBy: { createdAt: "asc" },
            include: {
                conversations: {
                    include: {
                        conversation: {
                            include: {
                                sender: { include: { profile: { include: { user: true } } } },
                                receiver: { include: { profile: { include: { user: true } } } },
                            }
                        },
                    }
                }
            }
        });

        if (!group) {
            throw new Error("Group not found or you do not have access to it.");
        }

        return group.conversations.map(groupMessage => {

            const senderProfile = groupMessage.conversation.sender?.profile;
            const receiverProfile = groupMessage.conversation.receiver?.profile;

            return ConversationGroupsMessagesPublic.fromPrismaToGroupMessagesPublic({
                ...group,
                conversation: {
                    ...groupMessage.conversation,
                    sender: { ...senderProfile!, user: senderProfile!.user! },
                    receiver: { ...receiverProfile!, user: receiverProfile!.user! }
                }
            });
        });
    }

    static async sendGroupMessage(
        groupId: string,
        userId: string,
        req: { content: string }
    ): Promise<ConversationGroupsMessagesPublic> {
        req = groupMessageSchema.parse(req);
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
                    where: { isDeleted: false },
                    include: { user: true },
                },
            },
        });

        if (!group) {
            throw new Error("Group not found or you do not have access to it.");
        }

        const bulkMessage = await this.conversationRepository.create({
            data: {
                content: req.content,
                senderId: userId,
                receiverId: group.owner.id
            },
        });

        const groupMessage = await this.conversationGroupMessagesRepository.create({
            data: {
                groupId: groupId,
                conversationId: bulkMessage.id,
            },
            include: {
                conversation: {
                    include: {
                        sender: { include: { profile: { include: { user: true } } } },
                        receiver: { include: { profile: { include: { user: true } } } },
                    }
                },
            }
        });


        return ConversationGroupsMessagesPublic.fromPrismaToGroupMessagesPublic({
            ...groupMessage,
            ...group,
            conversation: {
                ...groupMessage.conversation,
                sender: { ...groupMessage.conversation.sender.profile!, user: groupMessage.conversation.sender.profile!.user! },
                receiver: { ...groupMessage.conversation.receiver.profile!, user: groupMessage.conversation.receiver.profile!.user! }
            },
        });
    }

    static async deleteGroupMessage(
        groupId: string,
        messageId: string,
        userId: string
    ): Promise<void> {
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
                members: true,
            },
        });

        if (!group) {
            throw new Error("Group not found or you do not have access to it.");
        }

        const message = await this.conversationRepository.findUnique({
            where: { id: messageId },
            include: { sender: true, receiver: true }
        });

        if (!message || (message.senderId !== userId && message.receiverId !== userId)) {
            throw new Error("Message not found or you do not have permission to delete it.");
        }

        await this.conversationRepository.update({
            where: { id: messageId },
            data: { isDeletedBySender: true }
        });
    }

    static async deleteGroupMessagesByOwnerGroup(
        groupId: string,
        userId: string
    ): Promise<void> {
        const group = await this.conversationGroupRepository.findFirst({
            where: {
                id: groupId,
                ownerId: userId,
                isDeleted: false
            }
        });

        if (!group) {
            throw new Error("Group not found or you do not have permission to delete messages.");
        }

        await this.conversationGroupMessagesRepository.updateMany({
            data: { isDeletedByOwner: true },
            where: { groupId: groupId }
        });
    }
}