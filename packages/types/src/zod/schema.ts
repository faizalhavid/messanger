import z from "zod";



export const AllowedFileTypeEnum = z.enum(['image', 'video', 'document', 'audio']);

export const AllowedFileSchema = z.object({
    format: AllowedFileTypeEnum,
    maxSize: z.number().int().positive(),
});

export const imageTypeSchema = z.object({
    url: z.string().url(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    format: AllowedFileSchema,
});

export const fileTypeSchema = z.object({
    name: z.string().min(1),
    url: z.string().url(),
    size: z.number().int().nonnegative(),
    type: AllowedFileSchema,
    createdAt: z.coerce.date(),
});


// export type ImageType = z.infer<typeof ImageTypeSchema>;
// export type FileType = z.infer<typeof FileTypeSchema>;


export const BiodataSchema = z.object({
    id: z.string().uuid(),
    gender: z.string().min(2).max(100),
    phone: z.string().min(10).max(15),
    address: z.string().min(5).max(200),
    birthDate: z.date()
});


export const UserProfileSchema = z.object({
    username: z.string().min(3).max(20).optional(),
    // email: z.string().email().max(100).optional(),
    avatar: imageTypeSchema.nullable().optional(),
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    // bio: BiodataSchema.optional(),
    // createdAt: z.coerce.date(),
    // updatedAt: z.coerce.date(),
    // isActive: z.boolean().default(true),
    // isDeleted: z.boolean().default(false),
});

export const friendshipSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    friendId: z.string().min(1, "Friend ID is required"),
    status: z.enum(['PENDING', 'ACCEPTED', 'BLOCKED', 'DECLINED']).default('PENDING'),
}).refine(
    (data) => data.userId !== data.friendId,
    {
        message: "User ID and Friend ID cannot be the same.",
        path: ['friendId'],
    }
);

export const conversationThreadSchema = z.object({
    threadId: z.string().min(1, "Thread ID is required"),
    content: z.string().min(1, "Content is required").max(5000),
    senderId: z.string().min(1, "Sender ID is required")
})

export const threadSchema = z.object({
    name: z.string().min(1, "Thread name is required").max(100),
    creatorId: z.string().min(1, "Creator ID is required").optional(),
    participantIds: z.array(z.string().min(1, "Participant ID is required")).optional(),
    type: z.enum(['PRIVATE', 'GROUP']).default('PRIVATE'),
})
    .refine(
        (data) =>
            (data.type === 'PRIVATE' && (data.participantIds?.length === 1)) ||
            (data.type === 'GROUP' && ((data.participantIds?.length ?? 0) >= 2)),
        {
            message: "For PRIVATE, exactly one participant is required (the interlocutor). For GROUP, at least two participants are required.",
            path: ['type'],
        }
    );

export const threadParticipantSchema = z.object({
    threadId: z.string().min(1, "Thread ID is required"),
    participantId: z.string().min(1, "User ID is required"),
    isRead: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
}).refine(
    (data) => !!data.threadId && !!data.participantId,
    {
        message: "Both threadId and userId are required.",
        path: ['threadId', 'userId'],
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

export const tokenSchema = z.string().min(1, "Token is required");


