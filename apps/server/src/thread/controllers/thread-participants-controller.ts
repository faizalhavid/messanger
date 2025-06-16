import { HonoContext } from "@messanger/types";
import { Hono } from "hono";
import { ThreadParticipantService } from "../services/thread-participants-service";


export const threadParticipantsController = new Hono<{ Variables: HonoContext }>();
const controller = threadParticipantsController;

controller.get("/", async (c) => {
    const user = c.get("authenticatedUser");
    const queryParams = c.req.query();
    const threadId = c.req.query('threadId');
    if (!threadId) {
        return c.json({ success: false, message: "Missing thread id", data: null }, 400);
    }
    const { items, meta } = await ThreadParticipantService.getThreadParticipantsByThreadId(threadId, user.id, queryParams);
    return c.json({
        success: true,
        message: "Thread participants retrieved successfully",
        data: { items, meta }
    });
});

controller.post("/", async (c) => {
    const user = c.get("authenticatedUser");
    const threadId = c.req.query('threadId');
    if (!threadId) {
        return c.json({ success: false, message: 'Missing thread id', data: null }, 400);
    }
    const request = await c.req.json();
    const result = await ThreadParticipantService.addNewParticipants(request, threadId, user.id);
    return c.json({
        success: true,
        message: "Thread participant added successfully",
        data: result
    });
});

controller.patch("/:id", async (c) => {
    const user = c.get("authenticatedUser");
    const threadId = c.req.query('threadId');
    if (!threadId) {
        return c.json({ success: false, message: "Missing thread id", data: null }, 400);
    }
    const request = await c.req.json();
    const result = await ThreadParticipantService.updateParticipant(threadId, user.id, request);
    return c.json({
        success: true,
        message: "Thread participant updated successfully",
        data: result
    });
});
