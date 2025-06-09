import { send } from "process";
import { prismaClient } from "@messanger/prisma";
import { ConversationRequest, ConversationPublic, messageSchema } from "@messanger/types";




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

    static async getMessageById(messageId: string, userId: string): Promise<ConversationPublic> {
        const message = await this.conversationRepository.findUniqueOrThrow({
            where: { id: messageId },
            include: { sender: { include: { profile: { include: { user: true } } } }, receiver: { include: { profile: { include: { user: true } } } } }
        });
        if (message.receiverId !== userId && message.senderId !== userId) {
            throw new Error("Unauthorized");
        }
        return ConversationPublic.fromConversationToConversationPublic({ ...message, sender: message.sender.profile!, receiver: message.receiver.profile! });
    }

    static async getMessages(userId: string): Promise<ConversationPublic[]> {
        console.log("Fetching messages for user:", userId);
        const messages = await this.conversationRepository.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId },
                    { isDeletedBySender: false },
                    { isDeletedByReceiver: false }
                ]
            },
            orderBy: { createdAt: "asc" },
            include: {
                sender: { include: { profile: { include: { user: true } } } },
                receiver: { include: { profile: { include: { user: true } } } }
            }
        });
        return messages.map(message => {
            const sender = message.sender;
            const receiver = message.receiver;
            return ConversationPublic.fromConversationToConversationPublic({ ...message, sender: sender.profile!, receiver: receiver.profile! });
        });
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