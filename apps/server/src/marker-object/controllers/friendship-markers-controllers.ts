

import { HonoContext } from "@messanger/types";
import { Hono } from "hono";
import { FriendshipMarkersService } from "../services/friendship-markers-services";






export const friendshipMarkersController = new Hono<{ Variables: HonoContext }>();
const controller = friendshipMarkersController;

controller.get('all', async (c) => {
    const user = c.get('authenticatedUser');
    const friendshipId = c.req.param('threadId');
    const queryParams = c.req.query();
    if (!friendshipId) {
        return c.json({ success: false, message: 'Missing friendship id', data: null }, 400);
    }
    return c.json({
        success: true,
        message: 'Friendship markers retrieved successfully',
        data: await FriendshipMarkersService.getAllFriendshipMarkers(friendshipId, user.id, queryParams),
    });
});

controller.get('/:id', async (c) => {
    const user = c.get('authenticatedUser');
    const friendshipId = c.req.param('friendshipId');
    const markerId = c.req.param('id');
    if (!friendshipId || !markerId) {
        return c.json({ success: false, message: 'Missing marker id or friendship id', data: null }, 400);
    }
    return c.json({
        success: true,
        message: 'Friendship marker retrieved successfully',
        data: await FriendshipMarkersService.getFriendshipMarkerById(markerId, friendshipId, user.id),
    });
});

controller.get('', async (c) => {
    const user = c.get('authenticatedUser');
    const friendshipId = c.req.param('friendshipId');
    if (!friendshipId) {
        return c.json({ success: false, message: 'Missing friendship id', data: null }, 400);
    }
    return c.json({
        success: true,
        message: 'Friendship markers retrieved successfully',
        data: await FriendshipMarkersService.getFriendshipMarkerByFriendshipId(friendshipId, user.id),
    });
});

controller.post('', async (c) => {
    const user = c.get('authenticatedUser');
    const friendshipId = c.req.param('friendshipId');
    if (!friendshipId) {
        return c.json({ success: false, message: 'Missing friendship id', data: null }, 400);
    }
    const request = await c.req.json();
    return c.json({
        success: true,
        message: 'Friendship marker created successfully',
        data: await FriendshipMarkersService.createFriendshipMarker(request, friendshipId, user.id),
    });
});


controller.patch('/:id', async (c) => {
    const user = c.get('authenticatedUser');
    const request = await c.req.json();
    const friendshipId = c.req.param('friendshipId');
    const markerId = c.req.param('id');
    if (!markerId || !friendshipId) {
        return c.json({ success: false, message: 'Missing marker id or friendship id', data: null }, 400);
    }
    return c.json({
        success: true,
        message: 'Friendship marker updated successfully',
        data: await FriendshipMarkersService.updateFriendshipMarker(request, markerId, friendshipId, user.id),
    });
});

controller.delete('/:id', async (c) => {
    const user = c.get('authenticatedUser');
    const markerId = c.req.param('id');
    const friendshipId = c.req.param('friendshipId');
    if (!markerId || !friendshipId) {
        return c.json({ success: false, message: 'Missing marker id or friendship id', data: null }, 400);
    }
    await FriendshipMarkersService.deleteFriendshipMarker(markerId, friendshipId, user.id);
    return c.json({
        success: true,
        message: 'Friendship marker deleted successfully',
        data: null,
    });
});
