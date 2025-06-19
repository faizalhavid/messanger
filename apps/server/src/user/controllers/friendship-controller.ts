import { HonoContext } from "@messanger/types";
import { Hono } from "hono";
import { FriendshipService } from "../services/friendship-service";





export const friendshipController = new Hono<{ Variables: HonoContext }>();
const controller = friendshipController;


controller.get('/', async (c) => {
    const user = c.get('authenticatedUser');
    const queryParams = c.req.query();
    const { items, meta } = await FriendshipService.getFriendshipList(user.id, queryParams);
    return c.json({
        success: true,
        message: 'Friendships retrieved successfully',
        data: { items, meta }
    });
});

controller.post('/', async (c) => {
    const user = c.get('authenticatedUser');
    const request = await c.req.json();
    const result = await FriendshipService.createFriendship(request, user.id);
    return c.json({
        success: true,
        message: 'Friendship created successfully',
        data: result
    });
});

controller.patch('/:id', async (c) => {
    const user = c.get('authenticatedUser');
    const friendshipId = c.req.param('id');
    const request = await c.req.json();
    const result = await FriendshipService.updateFriendshipStatus(friendshipId, user.id, request);
    return c.json({
        success: true,
        message: 'Friendship updated successfully',
        data: result
    });
});

controller.delete('/:id', async (c) => {
    const user = c.get('authenticatedUser');
    const friendshipId = c.req.param('id');
    await FriendshipService.deleteFriendship(friendshipId, user.id);
    return c.json({
        success: true,
        message: 'Friendship deleted successfully',
        data: null
    });
});
