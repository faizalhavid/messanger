import { UserPublic } from "@types/user/user";
import { WSContext } from "hono/ws";

export enum WsEventName {
    Authentication = 'authentication',
    MessageCreated = "message-created",
    MessageDeleted = "message-deleted",
    Notification = "notification",
    // Todo: need to implement this
    //MessageUpdated = "message-updated",
    MessageRead = "message-read",
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
    Messages = "messages",
    Notifications = "notifications",
}

export type AppWSContext = WSContext<unknown> & {
    data?: {
        user?: UserPublic,
        topic: WsTopic,
        isAuthenticated: boolean
    }
};
