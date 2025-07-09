import { HonoContext } from "@messanger/types";
import { Hono } from "hono";
import { ThreadMarkersService } from "../services/thread-markers-services";






export const threadMarkersController = new Hono<{ Variables: HonoContext }>();
const controller = threadMarkersController;

controller.get('all', async (c) => {
    const user = c.get('authenticatedUser');
    const threadId = c.req.param('threadId');
    const queryParams = c.req.query();
    if (!threadId) {
        return c.json({ success: false, message: 'Missing thread id', data: null }, 400);
    }

    return c.json({
        success: true,
        message: 'Thread markers retrieved successfully',
        data: await ThreadMarkersService.getAllThreadMarkers(threadId, user.id, queryParams),
    });
});

controller.get('/:id', async (c) => {
    const user = c.get('authenticatedUser');
    const threadId = c.req.param('threadId');
    const markerId = c.req.param('id');
    if (!threadId || !markerId) {
        return c.json({ success: false, message: 'Missing thread id or marker id', data: null }, 400);
    }
    return c.json({
        success: true,
        message: 'Thread marker retrieved successfully',
        data: await ThreadMarkersService.getThreadMarkerById(markerId, threadId),
    })
})


controller.post('', async (c) => {
    const user = c.get('authenticatedUser');
    const threadId = c.req.param('threadId');
    const request = await c.req.json();
    if (!threadId) {
        return c.json({ success: false, message: 'Missing thread id', data: null }, 400);
    }
    return c.json({
        success: true,
        message: 'Thread marker created successfully',
        data: await ThreadMarkersService.createThreadMarker(request, threadId, user.id),
    })
})

controller.patch('/:id', async (c) => {
    const user = c.get('authenticatedUser');
    const threadId = c.req.param('threadId');
    const markerId = c.req.param('id');
    const request = await c.req.json();
    if (!threadId) {
        return c.json({ success: false, message: 'Missing thread id', data: null }, 400);
    }
    return c.json({
        success: true,
        message: 'Thread marker updated successfully',
        data: await ThreadMarkersService.updateThreadMarker(request, markerId, threadId, user.id),
    })
})