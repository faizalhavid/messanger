import type { Conversation, ConversationThread } from "@prisma/client";
import { ConversationPublic } from "./conversation";

export interface ConversationThreadRequest {
    userAId?: string;
    userBId?: string;
    groupId?: string;
    type: 'PRIVATE' | 'GROUP';
}

export interface ConversationThreadList extends Omit<ConversationThread, | 'userAId' | 'userBId' | 'groupId'> {
    interlocutor?: {
        id: string;
        username: string;
        avatar?: string | null;
    };
    lastMessage?: Omit<Conversation, 'senderId' | 'receiverId'>;
    updatedAt?: Date;
    unreadCount?: number;
    group?: {
        name: string;
        avatar?: string | null;
    };
}

export namespace ConversationThreadList {
    export function fromConversationThread(
        thread: ConversationThread,
        interlocutor?: {
            id: string;
            username: string;
            avatar?: string | null;
        },
        group?: {
            name: string;
            avatar?: string | null;
        },
        lastMessage: Conversation | undefined = undefined,
        lastMessageAt: Date | null = null,
        unreadCount: number = 0
    ): ConversationThreadList {
        return {
            ...thread,
            interlocutor: interlocutor ? {
                id: interlocutor.id,
                username: interlocutor.username,
                avatar: interlocutor.avatar ?? null
            } : undefined,
            group: group ? {
                name: group.name,
                avatar: group.avatar ?? null
            } : undefined,
            lastMessage: lastMessage,
            updatedAt: lastMessageAt ?? new Date(),
            unreadCount
        };
    }
}


export interface ConversationThreadMessages extends Omit<ConversationThreadList, 'lastMessage' | 'updatedAt' | 'unreadCount'> {
    messages: Omit<Conversation, 'senderId' | 'receiverId'>[];
}

export namespace ConversationThreadMessages {
    export function fromConversationThread(
        thread: ConversationThread,
        interlocutor?: {
            id: string;
            username: string;
            avatar?: string | null;
        },
        group?: {
            name: string;
            avatar?: string | null;
        },
        messages: Conversation[] = []
    ): ConversationThreadMessages {
        return {
            ...ConversationThreadList.fromConversationThread(thread, interlocutor, group),
            messages
        };
    }
}