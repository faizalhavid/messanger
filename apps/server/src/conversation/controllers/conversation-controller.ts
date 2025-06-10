import { HonoContext, ListUserConversationsResponse } from "@messanger/types";
import { Hono } from "hono";
import { ConversationService } from "../services/conversation-service";
import { BaseApiResponse, PaginatedResponse } from "@messanger/types";
import { ConversationPublic } from "@messanger/types";
import { WsBroadcastEvent, WsEventName } from "src/websocket/websocket";
import { server } from "src";
import { randomUUID } from "crypto";

export const conversationController = new Hono<{ Variables: HonoContext }>();
const topic = "conversation";


conversationController.get("/", async (c) => {
    const user = c.get("authenticatedUser");
    console.log("Fetching messages for user:", user);
    const messages = await ConversationService.getConversations(user.id);

    const page = 1;
    const pageSize = messages.length;
    const totalItems = messages.length;
    const totalPages = 1;

    const paginationResponse: PaginatedResponse<ConversationPublic> = {
        success: true,
        message: "Messages retrieved successfully",
        data: {
            items: messages,
            meta: {
                totalItems,
                totalPages,
                page,
                pageSize,
                hasNextPage: false,
                hasPreviousPage: false
            }
        }
    };
    return c.json(paginationResponse);
});

conversationController.get("/:id", async (c) => {
    const userA = c.get("authenticatedUser");
    const userB = c.req.param("id");
    const message = await ConversationService.getConversationBetweenUsers(userA.id, userB);

    const response: PaginatedResponse<ConversationPublic> = {
        success: true,
        message: "Message retrieved successfully",
        data: {
            items: message,
            meta: {
                totalItems: 1,
                totalPages: 1,
                page: 1,
                pageSize: 1,
                hasNextPage: false,
                hasPreviousPage: false
            }
        }
    };

    return c.json(response);
});

conversationController.post("/", async (c) => {
    const user = c.get("authenticatedUser");

    const request = await c.req.json();
    const result = await ConversationService.sendMessage(request, user.id);

    const broadcastPayload = generateWSBroadcastPayload<ConversationPublic>(result, WsEventName.ConversationCreated);

    const response: BaseApiResponse = {
        success: true,
        message: "Message sent successfully",
        data: result,
    };
    server.publish(topic, JSON.stringify(broadcastPayload));
    return c.json(response);
});

conversationController.delete("/:id", async (c) => {
    const user = c.get("authenticatedUser");
    const messageId = c.req.param("id");
    const broadcastPayload = generateWSBroadcastPayload<{ messageId: string; userId: string }>(
        { messageId, userId: user.id },
        WsEventName.ConversationDeleted
    );
    await ConversationService.deleteMessage(messageId, user.id);

    server.publish(topic, JSON.stringify(broadcastPayload));

    const response: BaseApiResponse = {
        success: true,
        message: "Message deleted successfully",
        data: null,
    };
    return c.json(response);
})

function generateWSBroadcastPayload<T>(
    data: T,
    event: WsEventName
): WsBroadcastEvent<T> {
    // @ts-ignore
    return {
        event: event,
        timestamp: Date.now(),
        // @ts-ignore
        senderId: (data as any).senderId,
        data: data,
        requestId: randomUUID(),
    };
}
