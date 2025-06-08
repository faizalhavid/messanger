import { send } from "process";
import { prismaClient } from "@messanger/prisma";
import { MessageRequest, MessagePublic, messageSchema } from "@messanger/types";




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
            },
            include: {
                sender: { include: { profile: true } },
                receiver: { include: { profile: true } }
            }
        });
        return MessagePublic.fromMessage({
            ...message,
            sender: { ...sender.profile!, user: { ...sender } },
            receiver: { ...receiver.profile!, user: { ...receiver } }
        });
    }

    static async getMessageById(messageId: string, userId: string): Promise<MessagePublic> {
        const message = await this.messageRepository.findUniqueOrThrow({
            where: { id: messageId },
            include: { sender: { include: { profile: { include: { user: true } } } }, receiver: { include: { profile: { include: { user: true } } } } }
        });
        if (message.receiverId !== userId && message.senderId !== userId) {
            throw new Error("Unauthorized");
        }
        return MessagePublic.fromMessage({ ...message, sender: message.sender.profile!, receiver: message.receiver.profile! });
    }

    static async getMessages(userId: string): Promise<MessagePublic[]> {
        console.log("Fetching messages for user:", userId);
        const messages = await this.messageRepository.findMany({
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
            return MessagePublic.fromMessage({ ...message, sender: sender.profile!, receiver: receiver.profile! });
        });
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