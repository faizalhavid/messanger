import { HonoContext } from "@messanger/types";
import { Hono } from "hono";
import { ThreadService } from "../services/thread-service";



export const threadController = new Hono<{ Variables: HonoContext }>();
const controller = threadController;

controller.get("/", async (c) => {
    const user = c.get('authenticatedUser');
    const queryParams = c.req.query();
    const { items, meta } = await ThreadService.getThreads(user.id, queryParams);
    return c.json({
        success: true,
        message: "Threads retrieved successfully",
        data: { items, meta }
    })
});

controller.get("/:id", async (c) => {
    const user = c.get("authenticatedUser");
    const threadId = c.req.param('id');
    const queryParams = c.req.query();
    const { meta, items, thread } = await ThreadService.getThreadConversations(threadId, user.id, queryParams)
    return c.json({
        success: true,
        message: "Thread retrieved successfully",
        data: { meta, items, thread }
    });
})

controller.post("/", async (c) => {
    const user = c.get('authenticatedUser');
    const request = await c.req.json();
    const result = await ThreadService.createThread(request, user.id);
    return c.json({
        success: true,
        message: "Thread created successfully",
        data: result
    })
})

controller.patch("/:id", async (c) => {
    const user = c.get("authenticatedUser");
    const request = await c.req.json()
    const threadId = c.req.param("id")
    const result = await ThreadService.updateThread(request, threadId, user.id)
    return c.json({
        success: true,
        message: 'Thread updated successfully',
        data: result
    })
})