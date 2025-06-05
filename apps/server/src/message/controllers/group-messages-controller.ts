import { HonoContext } from "@types/hono-context"
import { Hono } from "hono"
import { GroupMessagesService } from "../services/group-messages-service"

export const groupMessagesController = new Hono<{ Variables: HonoContext }>()

groupMessagesController.get("/:groupId", async (c) => {
    const user = c.get("authenticatedUser")
    const groupId = c.req.param("groupId")

    const messages = await GroupMessagesService.getGroupMessages(groupId, user.id)

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

groupMessagesController.post("/:groupId", async (c) => {
    const user = c.get("authenticatedUser")
    const groupId = c.req.param("groupId")

    const request = await c.req.json()
    const result = await GroupMessagesService.sendGroupMessage(groupId, user.id, request)

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

groupMessagesController.delete("/:groupId/messages/:messageId", async (c) => {
    const user = c.get("authenticatedUser")
    const groupId = c.req.param("groupId")
    const messageId = c.req.param("messageId")

    await GroupMessagesService.deleteGroupMessage(groupId, messageId, user.id)

    return c.json({
        success: true,
        message: "Group message deleted successfully"
    })
})

groupMessagesController.delete("/:groupId/messages/:messageId/by-owner", async (c) => {
    const user = c.get("authenticatedUser")
    const groupId = c.req.param("groupId")
    const messageId = c.req.param("messageId")

    await GroupMessagesService.deleteGroupMessagesByOwnerGroup(groupId, user.id)

    return c.json({
        success: true,
        message: "Group message deleted by owner successfully"
    })
})