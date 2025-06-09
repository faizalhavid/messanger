import type { Conversation, ConversationGroup, Profile, User } from "@prisma/client";
import { ConversationPublic } from "./conversation";




export interface ConversationGroupsMessagesPublic extends Omit<ConversationGroup, "messageId" | "updatedAt"> {
    conversation: ConversationPublic;
}

export namespace ConversationGroupsMessagesPublic {
    export function fromPrismaToGroupMessagesPublic(
        messageGroupMessages: ConversationGroup & {
            conversation: Conversation & { sender: Profile & { user: User }, receiver: Profile & { user: User } }
        }): ConversationGroupsMessagesPublic {
        return {
            ...messageGroupMessages,
            conversation: ConversationPublic.fromConversationToConversationPublic(messageGroupMessages.conversation)
        };
    }
}