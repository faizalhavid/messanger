import { send } from "process";
import { prismaClient } from "@messanger/prisma";
import { ConversationRequest, ConversationPublic, messageSchema, ConversationQueryParams, PaginatedResponse, PaginatedData } from "@messanger/types";




export class ConversationService {
    private static conversationRepository = prismaClient.conversation;

    static async sendMessage(data: ConversationRequest, senderId: string): Promise<ConversationPublic> {
        data = messageSchema.parse(data);
        const sender = await prismaClient.user.findFirst({
            where: { id: senderId },
            include: { profile: true }
        });
        if (!sender) {
            throw new Error("Sender not found");
        }
        const receiver = await prismaClient.user.findFirst({
            where: { id: data.receiverId },
            include: { profile: true }
        });
        if (!receiver) {
            throw new Error("Receiver not found");
        }
        if (sender.id === receiver.id) {
            throw new Error("Sender and receiver cannot be the same");
        }
        const message = await this.conversationRepository.create({
            data: {
                content: data.content,
                senderId: sender.id,
                receiverId: receiver.id
            },
            include: {
                sender: { include: { profile: true } },
                receiver: { include: { profile: true } }
            }
        });
        return ConversationPublic.fromConversationToConversationPublic({
            ...message,
            sender: { ...sender.profile!, user: { ...sender } },
            receiver: { ...receiver.profile!, user: { ...receiver } }
        });
    }

    static async getConversations(userId: string, queryParams: ConversationQueryParams): Promise<PaginatedData<ConversationPublic>> {
        console.log("Fetching conversations for user:", userId, "with query params:", queryParams);
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

    static async deleteMessage(messageId: string, userId: string): Promise<void> {
        const message = await this.conversationRepository.findUniqueOrThrow({
            where: { id: messageId },
            include: { sender: true, receiver: true }
        });
        if (message.senderId === userId) {
            await this.conversationRepository.update({
                where: { id: messageId },
                data: { isDeletedBySender: true }
            });
        } else if (message.receiverId === userId) {
            await this.conversationRepository.update({
                where: { id: messageId },
                data: { isDeletedByReceiver: true }
            });
        }
    }

}