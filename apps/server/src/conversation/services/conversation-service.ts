import { send } from "process";
import { prismaClient } from "@messanger/prisma";
import { ConversationRequest, ConversationPublic, messageSchema, ConversationQueryParams, PaginatedResponse, PaginatedData, ProfilePublic } from "@messanger/types";



export class ConversationService {
    private static conversationRepository = prismaClient.conversation;
    private static conversationThreadRepository = prismaClient.conversationThread;

    static async createConversation(data: ConversationRequest, userId: string): Promise<ConversationPublic> {
        data = messageSchema.parse(data);
        let thread = await this.conversationThreadRepository.findFirst({
            where: {
                userAId: userId,
                userBId: data.receiverId,
                type: 'PRIVATE'
            },
            include: {
                userA: { include: { profile: true } },
                userB: { include: { profile: true } }
            }
        });

        if (!thread) {
            thread = await this.conversationThreadRepository.create({
                data: {
                    type: 'PRIVATE',
                    userAId: userId,
                    userBId: data.receiverId
                },
                include: {
                    userA: { include: { profile: true } },
                    userB: { include: { profile: true } }
                }
            });
        }
        const conversation = await this.conversationRepository.create({
            data: {
                senderId: userId,
                receiverId: data.receiverId,
                content: data.content,
                conversationThreadId: thread.id
            },
            include: {
                receiver: { include: { profile: true } }
            }
        });
        const receiverProfile = {
            id: conversation.receiver.id,
            username: conversation.receiver.username,
            avatar: conversation.receiver.profile?.avatar
        }
        return ConversationPublic.fromConversationToConversationPublic({
            ...conversation,
            receiver: receiverProfile
        });
    }

    static async deleteMessage(messageId: string, userId: string): Promise<void> {

        const message = await this.conversationRepository.findUnique({
            where: { id: messageId },
            include: {
                ConversationThread: true
            }
        });

        if (!message) throw new Error("Message Not Fou d");

        // 2. Tentukan POV user (sender atau receiver)
        let updateData: Partial<{ isDeletedBySender: boolean; isDeletedByReceiver: boolean }> = {};

        if (message.senderId === userId) {
            updateData.isDeletedBySender = true;
        } else if (
            message.ConversationThread?.id &&
            (message.ConversationThread?.userAId === userId || message.ConversationThread?.userBId === userId)
        ) {
            updateData.isDeletedByReceiver = true;
        } else {
            throw new Error("You are not allowed to delete this message");
        }

        await this.conversationRepository.update({
            where: { id: messageId },
            data: updateData
        });

        const isDeletedBySender = updateData.isDeletedBySender ?? message.isDeletedBySender;
        const isDeletedByReceiver = updateData.isDeletedByReceiver ?? message.isDeletedByReceiver;

        if (isDeletedBySender && isDeletedByReceiver) {
            await this.conversationRepository.delete({
                where: { id: messageId }
            });
        }
    }

    /* 
        static async getConversations(userId: string, queryParams: ConversationQueryParams): Promise<PaginatedData<ConversationPublic>> {
        const { sortBy = "createdAt", sortOrder = "desc", page = 1, pageSize = 10, search, ...rest } = queryParams;
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const where: any = {
            AND: [
                {
                    OR: [
                        { senderId: userId },
                        { receiverId: userId }
                    ]
                },
                { NOT: [{ senderId: userId, receiverId: userId }] }
            ]
        };

        if (search) {
            where.AND.push({
                content: { contains: search, mode: "insensitive" }
            });
        }
        Object.assign(where, rest);

        const orderBy: any = {};
        orderBy[sortBy] = sortOrder;

        const [messages, totalItems] = await Promise.all([
            prismaClient.conversation.findMany({
                where,
                orderBy,
                skip,
                take,
                include: {
                    sender: { include: { profile: { include: { user: true } } } },
                    receiver: { include: { profile: { include: { user: true } } } }
                }
            }),
            prismaClient.conversation.count({ where })
        ]);


        const latestMessages = new Map<string, typeof messages[0]>();
        for (const message of messages) {
            const participantId = message.senderId === userId ? message.receiverId : message.senderId;
            if (!latestMessages.has(participantId)) {
                latestMessages.set(participantId, message);
            }
        }

        return {

            items: messages.map(message =>
                ConversationPublic.fromConversationToConversationPublic({
                    ...message,
                    sender: message.sender?.profile!,
                    receiver: message.receiver?.profile!
                })
            ),
            meta: {
                totalItems,
                totalPages: Math.ceil(totalItems / pageSize),
                page,
                pageSize,
                hasNextPage: page < Math.ceil(totalItems / pageSize),
                hasPreviousPage: page > 1
            }
        };
    }

    static async getConversationBetweenUsers(authenticatedUser: string, interlocutorUser: string): Promise<ConversationPublic[]> {
        const messages = await this.conversationRepository.findMany({
            where: {
                OR: [
                    { senderId: authenticatedUser, receiverId: interlocutorUser },
                    { senderId: interlocutorUser, receiverId: authenticatedUser }
                ],
                isDeletedBySender: false,
                isDeletedByReceiver: false
            },
            orderBy: { createdAt: "desc" },
            include: {
                sender: { include: { profile: { include: { user: true } } } },
                receiver: { include: { profile: { include: { user: true } } } }
            }
        });

        if (messages.length === 0) {
            throw new Error("No conversation found between these users.");
        }

        return messages
            .filter(msg => msg.sender?.profile && msg.receiver?.profile)
            .map(msg =>
                ConversationPublic.fromConversationToConversationPublic({
                    ...msg,
                    sender: msg.sender.profile!,
                    receiver: msg.receiver.profile!
                })
            );
    }
    */

}