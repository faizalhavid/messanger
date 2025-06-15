import { UserPublic } from "@messanger/types";
import { WSContext } from "hono/ws";

export enum WsEventName {
    Authentication = 'authentication',
    ConversationCreated = "conversation-created",
    ConversationDeleted = "conversation-deleted",
    Notification = "notification",
    ConversationThreadCreated = "conversation-thread-created",
    // Todo: need to implement this
    //ConversationUpdated = "conversation-updated",
    ConversationRead = "conversation-read",
    UserStatusChange = "user-status-change",
    UserTyping = "user-typing",
    UserOnline = "user-online",
    UserOffline = "user-offline"
}

export interface WsBroadcastEvent<T = any> {
    event: WsEventName;
    data: T;
    timestamp?: number;
    senderId?: string;
    requestId?: string;
}

export enum WsTopic {
    Conversations = "conversations",
    Notifications = "notifications",
}

export type AppWSContext = WSContext<unknown> & {
    data?: {
        user?: UserPublic,
        topic: WsTopic,
        isAuthenticated: boolean
    }
};
