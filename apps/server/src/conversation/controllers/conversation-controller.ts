import { ConversationQueryParams, HonoContext, ListUserConversationsResponse, WsTopic } from "@messanger/types";
import { Hono } from "hono";
import { ConversationService } from "../services/conversation-service";
import { BaseApiResponse, PaginatedResponse } from "@messanger/types";
import { ConversationPublic } from "@messanger/types";
import { WsBroadcastEvent, WsEventName } from "@messanger/types";
import { server } from "src";
import { randomUUID } from "crypto";

export const conversationController = new Hono<{ Variables: HonoContext }>();



conversationController.get("/", async (c) => {
    const user = c.get("authenticatedUser");
    const queryParams = c.req.query();
    const { items, meta } = await ConversationService.getConversations(user.id, queryParams);

    const response: PaginatedResponse<ConversationPublic> = {
        success: true,
        message: "Messages retrieved successfully",
        data: { items, meta }
    };
    return c.json(response);
});
conversationController.get("/:id", async (c) => {
    const authenticatedUser = c.get("authenticatedUser");
    const interlocutorUserId = c.req.param("id");
    const messages = await ConversationService.getConversationBetweenUsers(authenticatedUser.id, interlocutorUserId);

    const response: PaginatedResponse<ConversationPublic> = {
        success: true,
        message: "Message retrieved successfully",
        data: {
            items: messages,
            meta: {
                totalItems: messages.length,
                totalPages: 1,
                page: 1,
                pageSize: messages.length,
                hasNextPage: false,
                hasPreviousPage: false
            }
        }
    };

    return c.json(response);
});

conversationController.get("/:id", async (c) => {
    const authenticatedUser = c.get("authenticatedUser");
    const interlocutorUserId = c.req.param("id");
    const message = await ConversationService.getConversationBetweenUsers(authenticatedUser.id, interlocutorUserId);

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
    server.publish(WsTopic.Conversations, JSON.stringify(broadcastPayload));
    console.log("Broadcasting message to topic:", WsTopic.Conversations, "Payload:", broadcastPayload);
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

    server.publish(WsTopic.Conversations, JSON.stringify(broadcastPayload));

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
