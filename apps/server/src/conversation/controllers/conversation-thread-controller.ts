import { BaseApiResponse, ConversationThreadMessages, HonoContext, PaginatedResponse, WsEventName, WsTopic } from "@messanger/types";
import { Hono } from "hono";
import { ConversationService } from "../services/conversation-service";
import { ConversationThreadService } from "../services/conversation-thread-service";
import { generateWSBroadcastPayload } from "src/websocket/config";
import { server } from "src";
import { Conversation } from "@prisma/client";




export const conversationThreadController = new Hono<{ Variables: HonoContext }>();


conversationThreadController.get("/", async (c) => {
    const user = c.get("authenticatedUser");
    const queryParams = c.req.query();
    const { items, meta } = await ConversationThreadService.getConversationThreads(user.id, queryParams);

    const response: PaginatedResponse<ConversationService> = {
        success: true,
        message: "Conversations retrieved successfully",
        data: { items, meta }
    };
    return c.json(response);
});

conversationThreadController.get("/:id", async (c) => {
    const authenticatedUser = c.get("authenticatedUser");
    const threadId = c.req.param("id");
    const queryParams = c.req.query();
    const result = await ConversationThreadService.getConversationThreadById(threadId, authenticatedUser.id, queryParams);

    if (!result) {
        const response: BaseApiResponse = {
            success: false,
            message: "Conversation not found"
        };
        return c.json(response, 404);
    }

    const { thread, items, meta } = result;

    const response: PaginatedResponse<Conversation> = {
        success: true,
        message: "Conversation retrieved successfully",
        data: {
            thread,
            items,
            meta
        }
    };
    return c.json(response);
});

conversationThreadController.post("/", async (c) => {
    const authenticatedUser = c.get("authenticatedUser");
    const request = await c.req.json();
    try {
        const result = await ConversationThreadService.createConversationThread(request, authenticatedUser.id);
        const broadcastPayload = generateWSBroadcastPayload(result, WsEventName.ConversationThreadCreated);
        server.publish(WsTopic.Conversations, JSON.stringify(broadcastPayload));
        return c.json({ success: true, message: "Conversation created successfully", data: result });
    } catch (error) {
        return c.json({ success: false, message: (error instanceof Error ? error.message : "An error occurred") }, 500);
    }
});

conversationThreadController.delete("/:id", async (c) => {
    const authenticatedUser = c.get("authenticatedUser");
    const threadId = c.req.param("id");

    try {
        await ConversationThreadService.deleteConversationThread(threadId, authenticatedUser.id,);
        return c.json({ success: true, message: "Conversation deleted successfully" });
    } catch (error) {
        return c.json({ success: false, message: (error instanceof Error ? error.message : "An error occurred") }, 404);
    }
});
