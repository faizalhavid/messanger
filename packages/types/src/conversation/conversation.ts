import type { Conversation, Profile, User } from "@prisma/client";
import { ProfilePublic } from "../user/profile";
import { UserPublic } from "packages/types";


export type ConversationRequest = {
    content: string;
    receiverId: string;
}

export interface ConversationGroupsMessagesRequest {
    message: ConversationRequest;
}


export interface ConversationUserProfile {
    id: string;
    username: string;
    avatar?: string | null;
}

export interface ConversationPublic extends Omit<Conversation, "updatedAt" | "receiverId"> {
    // sender: ConversationUserProfile;
    receiver: ConversationUserProfile;
}

export namespace ConversationPublic {
    export function fromConversationToConversationPublic(
        conversation: Conversation & { receiver: ConversationUserProfile }
    ): ConversationPublic {
        const receiverProfile = {
            id: conversation.receiver.id,
            username: conversation.receiver.username,
            avatar: conversation.receiver?.avatar
        };

        return {
            id: conversation.id,
            conversationThreadId: conversation.conversationThreadId,
            content: conversation.content,
            isRead: conversation.isRead,
            createdAt: conversation.createdAt,
            isDeletedBySender: conversation.isDeletedBySender,
            isDeletedByReceiver: conversation.isDeletedByReceiver,
            senderId: conversation.senderId,
            receiver: receiverProfile
        };
    }
}



export interface ListUserConversationsResponse {
    lastMessage: ConversationPublic | null;
    sender: ConversationUserProfile;
    updatedAt: Date;
    receiver: ConversationUserProfile;
    // unreadCount: number;
}

