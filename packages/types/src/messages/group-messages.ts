import type { Message, MessageGroupMessages } from "@prisma/client";
import { MessagePublic } from "./message";




export interface MessageGroupsMessagesPublic extends Omit<MessageGroupMessages, "messageId" | "updatedAt"> {
    message: MessagePublic;
}

export namespace MessageGroupsMessagesPublic {
    export function fromMessageGroupMessages(
        messageGroupMessages: MessageGroupMessages &
        { message: Message }):
        MessageGroupsMessagesPublic {
        return {
            ...messageGroupMessages,
            message: MessagePublic.fromMessage(messageGroupMessages.message),
        };
    }
}