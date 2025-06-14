import z from "zod";


export const BiodataSchema = z.object({
    id: z.string().uuid(),
    gender: z.string().min(2).max(100),
    phone: z.string().min(10).max(15),
    address: z.string().min(5).max(200),
    birthDate: z.date()
});


export const ProfileSchema = z.object({
    firstName: z.string().min(2).max(100),
    lastName: z.string().min(2).max(100),
});


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

export const conversationThreadSchema = z.object({
    userAId: z.string().min(1, "User A ID is required").optional(),
    userBId: z.string().min(1, "User B ID is required").optional(),
    groupId: z.string().min(1, "Group ID is required").optional(),
    type: z.enum(['PRIVATE', 'GROUP']),
}).refine(
    (data) =>
        (data.type === 'PRIVATE' && !!data.userAId && !!data.userBId && !data.groupId) ||
        (data.type === 'GROUP' && !!data.groupId && !data.userAId && !data.userBId),
    {
        message: "For PRIVATE, userAId and userBId are required and groupId must be empty. For GROUP, groupId is required and userAId/userBId must be empty.",
        path: ['type'],
    }
);

export const registerSchema = z.object({
    username: z.string().min(3).max(20).optional(),
    password: z.string().min(6).max(50).regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,50}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
    confirmPassword: z.string().min(6).max(50).regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,50}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
    email: z.string().email().max(100).optional()
})
    .refine(
        (data) => !!data.username || !!data.email,
        { message: "Either username or email is required", path: ["username", "email"] }
    )
    .refine(
        (data) => data.password === data.confirmPassword,
        { message: "Passwords do not match", path: ["confirmPassword"] }
    );

export const loginSchema = z.object({
    username: z.string().min(3).max(20).optional(),
    password: z.string().min(6).max(50),
    email: z.string().email().max(100).optional()
}).refine(
    (data) => !!data.username || !!data.email,
    { message: "Either username or email is required", path: ["username", "email"] }
);

export const changePasswordSchema = z.object({
    email: z.string().email().max(100)
});

export const validateChangePassword = z.object({
    token: z.string().min(1, "Token is required"),
    email: z.string().email().max(100)
})

export const logoutSchema = z.object({
    token: z.string().min(1, "Token is required")
});

export const imageSchema = z.object({
    image: z.instanceof(File).refine(file => file.size <= 5 * 1024 * 1024, {
        message: "Image size must not exceed 5MB"
    }).refine(file => ['image/jpeg', 'image/png', 'image/gif'].includes(file.type), {
        message: "Image must be in JPEG, PNG, or GIF format"
    })
});

export const fileSchema = z.object({
    file: z.instanceof(File).refine(file => file.size <= 10 * 1024 * 1024, {
        message: "File size must not exceed 10MB"
    }).refine(file => ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type), {
        message: "File must be in PDF or Word format"
    })
});

export const tokenSchema = z.string().min(1, "Token is required");
