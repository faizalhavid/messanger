import { z, ZodType } from "zod";


export const messageSchema = z.object({
    content: z.string().min(1, "Message content is required").max(500, "Message content must not exceed 500 characters"),
    receiverId: z.string().min(1, "User ID is required")
})
    .refine(
        (data) => data.content.trim().length > 0,
        { message: "Message content cannot be empty", path: ["content"] }
    )
    .refine(
        (data) => data.receiverId.trim().length > 0,
        { message: "User ID cannot be empty", path: ["userId"] }
    )
    .refine(
        (data) => data.content.length <= 500,
        { message: "Message content must not exceed 500 characters", path: ["content"] }
    );

export const messageGroupsBaseSchema = z.object({
    name: z.string().min(1, "Group name is required").max(100, "Group name must not exceed 100 characters"),
    members: z.array(z.string().min(1, "User ID is required")),
    description: z.string().max(500, "Description must not exceed 500 characters").optional(),
    isPublic: z.boolean().optional().default(false)
});

export const messageGroupsSchema = messageGroupsBaseSchema
    .refine(data => data.members.length > 0, {
        message: "At least one member is required",
        path: ["members"]
    })
    .refine(data => data.name.trim().length > 0, {
        message: "Group name cannot be empty",
        path: ["name"]
    })
    .refine(data => data.name.length <= 100, {
        message: "Group name must not exceed 100 characters",
        path: ["name"]
    })
    .refine(data => data.description ? data.description.length <= 500 : true, {
        message: "Description must not exceed 500 characters",
        path: ["description"]
    })
    .refine(data => data.members.every(member => member.trim().length > 0), {
        message: "All member IDs must be non-empty strings",
        path: ["members"]
    });

export const groupMessageSchema = z.object({
    content: z.string().min(1, "Message content is required").max(500, "Message content must not exceed 500 characters")
});