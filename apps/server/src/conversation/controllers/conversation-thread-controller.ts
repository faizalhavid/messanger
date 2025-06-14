import { BaseApiResponse, ConversationThreadMessages, HonoContext, PaginatedResponse } from "@messanger/types";
import { Hono } from "hono";
import { ConversationService } from "../services/conversation-service";
import { ConversationThreadService } from "../services/conversation-thread-service";




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
    const result = await ConversationThreadService.getConversationThreadById(authenticatedUser.id, threadId, queryParams);

    if (!result) {
        const response: BaseApiResponse = {
            success: false,
            message: "Conversation not found"
        };
        return c.json(response, 404);
    }

    const { items, meta } = result;

    const response: PaginatedResponse<ConversationThreadMessages> = {
        success: true,
        message: "Conversation retrieved successfully",
        data: {
            items,
            meta
        }
    };
    return c.json(response);
});

conversationThreadController.delete("/:id", async (c) => {
    const authenticatedUser = c.get("authenticatedUser");
    const threadId = c.req.param("id");

    try {
        await ConversationThreadService.deleteConversationThread(authenticatedUser.id, threadId);
        return c.json({ success: true, message: "Conversation deleted successfully" });
    } catch (error) {
        return c.json({ success: false, message: (error instanceof Error ? error.message : "An error occurred") }, 404);
    }
});
