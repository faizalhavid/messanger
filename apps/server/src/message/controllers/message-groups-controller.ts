import { HonoContext } from "@types/hono-context";
import { BaseApiResponse, PaginatedResponse } from "@types/api-response";
import { MessageGroupsPublic, MessagePublic } from "@messanger/types";
import { MessageGroupService } from "../services/message-groups-service";
import { Hono } from "hono";



export const messageGroupsController = new Hono<{ Variables: HonoContext }>();
// list group user
messageGroupsController.get("/", async (c) => {
    const user = c.get("authenticatedUser");
    const result = await MessageGroupService.getUserMessageGroups(user.id);
    const response: PaginatedResponse<MessageGroupsPublic> = {
        success: true,
        message: "User groups retrieved successfully",
        data: {
            items: result,
            meta: {
                totalItems: result.length,
                totalPages: 1,
                page: 1,
                pageSize: result.length,
                hasNextPage: false,
                hasPreviousPage: false
            }
        }
    };
    return c.json(response);
});

// get group by id
messageGroupsController.get("/:id", async (c) => {
    const user = c.get("authenticatedUser");
    const groupId = c.req.param("id");
    const group = await MessageGroupService.getMessageGroupsById(groupId, user.id);
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
    const response: BaseApiResponse<MessageGroupsPublic> = {
        success: true,
        message: "Group retrieved successfully",
        data: group,
    };
    return c.json(response);
});

// create group
messageGroupsController.post("/", async (c) => {
    const user = c.get("authenticatedUser");
    const request = await c.req.json();
    const result = await MessageGroupService.createMessageGroup(request, user.id);
    const response: BaseApiResponse<MessageGroupsPublic> = {
        success: true,
        message: "Group created successfully",
        data: result,
    };
    return c.json(response, 201);
});

// update group
messageGroupsController.patch("/:id", async (c) => {
    const user = c.get("authenticatedUser");
    const groupId = c.req.param("id");
    const request = await c.req.json();
    const result = await MessageGroupService.updateMessageGroup(groupId, request, user.id);
    const response: BaseApiResponse<MessageGroupsPublic> = {
        success: true,
        message: "Group updated successfully",
        data: result,
    };
    return c.json(response);
});

// delete member from group
messageGroupsController.delete("/:id/members/:memberId", async (c) => {
    const user = c.get("authenticatedUser");
    const groupId = c.req.param("id");
    const memberId = c.req.param("memberId");
    await MessageGroupService.deleteMemberFromGroup(groupId, user.id, memberId);
    const response: BaseApiResponse = {
        success: true,
        message: "Member removed from group successfully",
    };
    return c.json(response, 201);
});

messageGroupsController.delete("/:id", async (c) => {
    const user = c.get("authenticatedUser");
    const groupId = c.req.param("id");
    await MessageGroupService.deleteMessageGroup(groupId, user.id);
    const response: BaseApiResponse = {
        success: true,
        message: "Group deleted successfully",
    };
    return c.json(response);
});

messageGroupsController.get("/:id/messages", async (c) => {
    const user = c.get("authenticatedUser");
    const groupId = c.req.param("id");
    const messages = await MessageGroupService.getMessagesGroup(groupId, user.id);
    const response: PaginatedResponse<MessagePublic> = {
        success: true,
        message: "Messages retrieved successfully",
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

messageGroupsController.post("/:id/messages", async (c) => {
    const user = c.get("authenticatedUser");
    const groupId = c.req.param("id");
    const request = await c.req.json();
    const result = await MessageGroupService.sendMessageToGroup(request, groupId, user.id);
    const response: BaseApiResponse<MessagePublic> = {
        success: true,
        message: "Message sent to group successfully",
        data: result,
    };
    return c.json(response);
});