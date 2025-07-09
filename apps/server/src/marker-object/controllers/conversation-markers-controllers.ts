import { HonoContext } from "@messanger/types";
import { Hono } from "hono";
import { ConversationMarkersService } from "../services/conversation-markers-services";






export const conversationMarkersController = new Hono<{ Variables: HonoContext }>();
const controller = conversationMarkersController;




controller.get('all', async (c) => {
    const user = c.get('authenticatedUser');
    const threadId = c.req.param('threadId');
    const queryParams = c.req.query();
    if (!threadId) {
        return c.json({ success: false, message: 'Missing thread id', data: null }, 400);
    }
    return c.json({
        success: true,
        message: 'Conversation markers retrieved successfully',
        data: await ConversationMarkersService.getAllConversationMarkers(threadId, user.id, queryParams),
    });
});

controller.get('/:id', async (c) => {
    const user = c.get('authenticatedUser');
    const threadId = c.req.param('threadId');
    const conversationId = c.req.param('conversationId');
    const markerId = c.req.param('id');
    if (!threadId || !markerId || !conversationId) {
        return c.json({ success: false, message: 'Missing thread id or marker id or conversation id', data: null }, 400);
    }
    return c.json({
        success: true,
        message: 'Conversation marker retrieved successfully',
        data: await ConversationMarkersService.getConversationMarkerById(markerId, conversationId, threadId, user.id),
    });
});
controller.get('', async (c) => {
    const user = c.get('authenticatedUser');
    const threadId = c.req.param('threadId');
    const conversationId = c.req.param('conversationId');
    if (!threadId || !conversationId) {
        return c.json({ success: false, message: 'Missing thread id or conversation id', data: null }, 400);
    }
    return c.json({
        success: true,
        message: 'Conversation marker retrieved successfully',
        data: await ConversationMarkersService.getConversationMarkersByConversationId(conversationId, threadId, user.id),
    });
});

controller.post('', async (c) => {
    const user = c.get('authenticatedUser');
    const threadId = c.req.param('threadId');
    const conversationId = c.req.param('conversationId');
    if (!threadId || !conversationId) {
        return c.json({ success: false, message: 'Missing thread id or conversation id', data: null }, 400);
    }
    const request = await c.req.json();
    return c.json({
        success: true,
        message: 'Conversation marker created successfully',
        data: await ConversationMarkersService.createConversationMarker(request, threadId, conversationId, user.id),
    });
});

controller.patch('/:id', async (c) => {
    const user = c.get('authenticatedUser');
    const threadId = c.req.param('threadId');
    const conversationId = c.req.param('conversationId');
    const markerId = c.req.param('id');
    if (!threadId || !conversationId || !markerId) {
        return c.json({ success: false, message: 'Missing thread id or conversation id or marker id', data: null }, 400);
    }
    const request = await c.req.json();
    return c.json({
        success: true,
        message: 'Conversation marker updated successfully',
        data: await ConversationMarkersService.updateConversationMarker(request, threadId, conversationId, markerId, user.id),
    });
});

controller.delete('/:id', async (c) => {
    const user = c.get('authenticatedUser');
    const threadId = c.req.param('threadId');
    const conversationId = c.req.param('conversationId');
    const markerId = c.req.param('id');
    if (!threadId || !conversationId || !markerId) {
        return c.json({ success: false, message: 'Missing thread id or conversation id or marker id', data: null }, 400);
    }
    await ConversationMarkersService.deleteConversationMarker(markerId, conversationId, threadId, user.id);
    return c.json({
        success: true,
        message: 'Conversation marker deleted successfully',
        data: null,
    });
});