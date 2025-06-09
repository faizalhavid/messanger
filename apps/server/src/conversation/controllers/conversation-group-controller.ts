import { HonoContext } from "@messanger/types"
import { Hono } from "hono"
import { ConversationGroupMessagesService } from "../services/conversation-group-message-service"

export const conversationGroupController = new Hono<{ Variables: HonoContext }>()

conversationGroupController.get("/:groupId", async (c) => {
    const user = c.get("authenticatedUser")
    const groupId = c.req.param("groupId")

    const messages = await ConversationGroupMessagesService.getGroupMessages(groupId, user.id)

    return c.json({
        success: true,
        message: "Group messages retrieved successfully",
        data: messages
    })
})

// groupMessagesController.get("/:groupId/messages/:messageId", async (c) => {
//     const user = c.get("authenticatedUser")
//     const groupId = c.req.param("groupId")
//     const messageId = c.req.param("messageId")
//     const message = await GroupMessagesService.getGroupMessageById(groupId, messageId, user.id)
//     return c.json({
//         success: true,
//         message: "Group message retrieved successfully",
//         data: message
//     })
// })

conversationGroupController.post("/:groupId", async (c) => {
    const user = c.get("authenticatedUser")
    const groupId = c.req.param("groupId")

    const request = await c.req.json()
    const result = await ConversationGroupMessagesService.sendGroupMessage(groupId, user.id, request)

    return c.json({
        success: true,
        message: "Group message sent successfully",
        data: result
    })
})

// groupMessagesController.patch("/:groupId", async (c) => {
//     const user = c.get("authenticatedUser")
//     const groupId = c.req.param("groupId")

//     const request = await c.req.json()
//     const result = await GroupMessagesService.updateGroup(groupId, user.id, request)

//     return c.json({
//         success: true,
//         message: "Group updated successfully",
//         data: result
//     })
// })

conversationGroupController.delete("/:groupId/messages/:messageId", async (c) => {
    const user = c.get("authenticatedUser")
    const groupId = c.req.param("groupId")
    const messageId = c.req.param("messageId")

    await ConversationGroupMessagesService.deleteGroupMessage(groupId, messageId, user.id)

    return c.json({
        success: true,
        message: "Group message deleted successfully"
    })
})

conversationGroupController.delete("/:groupId/messages/:messageId/by-owner", async (c) => {
    const user = c.get("authenticatedUser")
    const groupId = c.req.param("groupId")
    const messageId = c.req.param("messageId")

    await ConversationGroupMessagesService.deleteGroupMessagesByOwnerGroup(groupId, user.id)

    return c.json({
        success: true,
        message: "Group message deleted by owner successfully"
    })
})