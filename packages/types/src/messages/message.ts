import type { Message, Profile, User } from "@prisma/client";
import { ProfilePublic } from "../user/profile";

export type MessageRequest = {
    content: string;
    receiverId: string;
}

export interface MessageUserProfile extends Omit<ProfilePublic, "updatedAt" | "bioId" | "userId"> { }

export interface MessagePublic extends Omit<Message, "updatedAt" | "senderId" | "receiverId"> {
    sender: MessageUserProfile;
    receiver: MessageUserProfile;
}

export namespace MessagePublic {
    export function fromMessage(
        message: Message & { sender: Profile & { user: User }, receiver: Profile & { user: User } }
    ): MessagePublic {
        return {
            id: message.id,
            content: message.content,
            createdAt: message.createdAt,
            isDeletedBySender: message.isDeletedBySender,
            isDeletedByReceiver: message.isDeletedByReceiver,
            sender: ProfilePublic.fromProfile(message.sender),
            receiver: ProfilePublic.fromProfile(message.receiver),
        };
    }
}

export interface MessageGroupsMessagesRequest {
    message: MessageRequest;
}

