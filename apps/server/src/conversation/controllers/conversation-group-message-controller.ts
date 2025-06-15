import { HonoContext } from '@messanger/types';
import { BaseApiResponse, PaginatedResponse } from '@messanger/types';
import { ConversationGroupsPublic, ConversationModelMapper } from '@messanger/types';
import { ConversationGroupService } from '../services/conversation-groups-service';
import { Hono } from 'hono';

export const conversationGroupMessagesController = new Hono<{ Variables: HonoContext }>();
// list group user
conversationGroupMessagesController.get('/', async (c) => {
  const user = c.get('authenticatedUser');
  const result = await ConversationGroupService.getUserMessageGroups(user.id);
  const response: PaginatedResponse<ConversationGroupsPublic> = {
    success: true,
    message: 'User groups retrieved successfully',
    data: {
      items: result,
      meta: {
        totalItems: result.length,
        totalPages: 1,
        page: 1,
        pageSize: result.length,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    },
  };
  return c.json(response);
});

// get group by id
conversationGroupMessagesController.get('/:id', async (c) => {
  const user = c.get('authenticatedUser');
  const groupId = c.req.param('id');
  const group = await ConversationGroupService.getMessageGroupsById(groupId, user.id);
  // TODO : Need to handle the case where the group is not found or user is not a member
  // if (!group) {
  //     return c.json({
  //         success: false,
  //         error: {
  //             code: "GROUP_NOT_FOUND",
  //             message: "Group not found or user is not a member"
  //         }
  //     }, 404);
  // }
  const response: BaseApiResponse<ConversationGroupsPublic> = {
    success: true,
    message: 'Group retrieved successfully',
    data: group,
  };
  return c.json(response);
});

// create group
conversationGroupMessagesController.post('/', async (c) => {
  const user = c.get('authenticatedUser');
  const request = await c.req.json();
  const result = await ConversationGroupService.createMessageGroup(request, user.id);
  const response: BaseApiResponse<ConversationGroupsPublic> = {
    success: true,
    message: 'Group created successfully',
    data: result,
  };
  return c.json(response, 201);
});

// update group
conversationGroupMessagesController.patch('/:id', async (c) => {
  const user = c.get('authenticatedUser');
  const groupId = c.req.param('id');
  const request = await c.req.json();
  const result = await ConversationGroupService.updateMessageGroup(groupId, request, user.id);
  const response: BaseApiResponse<ConversationGroupsPublic> = {
    success: true,
    message: 'Group updated successfully',
    data: result,
  };
  return c.json(response);
});

// delete member from group
conversationGroupMessagesController.delete('/:id/members/:memberId', async (c) => {
  const user = c.get('authenticatedUser');
  const groupId = c.req.param('id');
  const memberId = c.req.param('memberId');
  await ConversationGroupService.deleteMemberFromGroup(groupId, user.id, memberId);
  const response: BaseApiResponse = {
    success: true,
    message: 'Member removed from group successfully',
  };
  return c.json(response, 201);
});

conversationGroupMessagesController.delete('/:id', async (c) => {
  const user = c.get('authenticatedUser');
  const groupId = c.req.param('id');
  await ConversationGroupService.deleteMessageGroup(groupId, user.id);
  const response: BaseApiResponse = {
    success: true,
    message: 'Group deleted successfully',
  };
  return c.json(response);
});

conversationGroupMessagesController.get('/:id/messages', async (c) => {
  const user = c.get('authenticatedUser');
  const groupId = c.req.param('id');
  const messages = await ConversationGroupService.getMessagesGroup(groupId, user.id);
  const response: PaginatedResponse<ConversationModelMapper> = {
    success: true,
    message: 'Messages retrieved successfully',
    data: {
      items: messages,
      meta: {
        totalItems: messages.length,
        totalPages: 1,
        page: 1,
        pageSize: messages.length,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    },
  };
  return c.json(response);
});

conversationGroupMessagesController.post('/:id/messages', async (c) => {
  const user = c.get('authenticatedUser');
  const groupId = c.req.param('id');
  const request = await c.req.json();
  const result = await ConversationGroupService.sendMessageToGroup(request, groupId, user.id);
  const response: BaseApiResponse<ConversationModelMapper> = {
    success: true,
    message: 'Message sent to group successfully',
    data: result,
  };
  return c.json(response);
});
