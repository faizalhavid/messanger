import type { Conversation, Profile, User } from "@prisma/client";
import { ProfilePublic } from "../user/profile";

export type ConversationRequest = {
    content: string;
    receiverId: string;
}

export interface ConversationGroupsMessagesRequest {
    message: ConversationRequest;
}


export interface ConversationUserProfile extends Omit<ProfilePublic, "updatedAt" | "bioId" | "userId"> { }

export interface ConversationPublic extends Omit<Conversation, "updatedAt" | "senderId" | "receiverId"> {
    sender: ConversationUserProfile;
    receiver: ConversationUserProfile;
}

export namespace ConversationPublic {
    export function fromConversationToConversationPublic(
        conversation: Conversation & { sender: Profile & { user: User }, receiver: Profile & { user: User } }
    ): ConversationPublic {
        return {
            id: conversation.id,
            content: conversation.content,
            isRead: conversation.isRead,
            createdAt: conversation.createdAt,
            isDeletedBySender: conversation.isDeletedBySender,
            isDeletedByReceiver: conversation.isDeletedByReceiver,
            sender: ProfilePublic.fromProfile(conversation.sender),
            receiver: ProfilePublic.fromProfile(conversation.receiver),
        };
    }
    export function fromConversationToConversationPublicArray(
        conversations: Array<Conversation & { sender: Profile & { user: User }, receiver: Profile & { user: User } }>
    ): ConversationPublic[] {
        return conversations.map(ConversationPublic.fromConversationToConversationPublic);
    }
}

export interface ListUserConversationsResponse {
    lastMessage: ConversationPublic | null;
    sender: ConversationUserProfile;
    updatedAt: Date;
    receiver: ConversationUserProfile;
    // unreadCount: number;
}

