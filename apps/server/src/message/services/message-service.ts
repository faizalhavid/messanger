import { send } from "process";
import { messageSchema } from "../message-validations";
import { prismaClient } from "@messanger/prisma";
import { MessagePublic, MessageRequest } from "@types/messages/message";



export class MessageService {
    private static messageRepository = prismaClient.message;

    static async sendMessage(data: MessageRequest, senderId: string): Promise<MessagePublic> {
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
        const message = await this.messageRepository.create({
            data: {
                content: data.content,
                senderId: sender.id,
                receiverId: receiver.id
            }
        });
        return MessagePublic.fromMessage(message);
    }

    static async getMessageById(messageId: string, userId: string): Promise<MessagePublic> {
        const message = await this.messageRepository.findUniqueOrThrow({
            where: { id: messageId },
            include: { sender: true, receiver: true }
        });
        if (message.receiverId !== userId && message.senderId !== userId) {
            throw new Error("Unauthorized");
        }
        return MessagePublic.fromMessage(message);
    }

    static async getMessages(userId: string): Promise<MessagePublic[]> {
        const messages = await this.messageRepository.findMany({
            where: { OR: [{ senderId: userId }, { receiverId: userId }, { isDeletedBySender: false }, { isDeletedByReceiver: false }] },
            orderBy: { createdAt: "asc" },
            include: { sender: true, receiver: true }
        });
        return messages.map(MessagePublic.fromMessage);
    }

    static async deleteMessage(messageId: string, userId: string): Promise<void> {
        const message = await this.messageRepository.findUniqueOrThrow({
            where: { id: messageId },
            include: { sender: true, receiver: true }
        });
        if (message.senderId === userId) {
            await this.messageRepository.update({
                where: { id: messageId },
                data: { isDeletedBySender: true }
            });
        } else if (message.receiverId === userId) {
            await this.messageRepository.update({
                where: { id: messageId },
                data: { isDeletedByReceiver: true }
            });
        }
    }

}