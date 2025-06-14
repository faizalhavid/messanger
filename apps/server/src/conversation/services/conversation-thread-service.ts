import { prismaClient } from "@messanger/prisma";
import { ConversationPublic, ConversationQueryParams, ConversationThreadList, ConversationThreadMessages, ConversationThreadRequest, conversationThreadSchema, PaginatedData } from "@messanger/types";



export class ConversationThreadService {
    private static conversationThreadRepository = prismaClient.conversationThread;
    private static conversationRepository = prismaClient.conversation;
    private static userRepository = prismaClient.user;
    private static groupRepository = prismaClient.conversationGroup;

    static async getConversationThreads(userId: string, queryParams: ConversationQueryParams): Promise<PaginatedData<ConversationThreadList>> {
        const { sortBy = "updatedAt", sortOrder = "desc", page = 1, pageSize = 10, search, type = 'ALL', ...rest } = queryParams;
        const skip = (page - 1) * pageSize;
        const take = pageSize;


        const where: any = {
            OR: [
                { userAId: userId },
                { userBId: userId },
            ]
        };

        if (type !== 'ALL') {
            where.type = type;
        }

        if (search) {
            where.OR = [
                ...where.OR,
                {
                    group: {
                        name: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                }
            ];
        }

        // Count total items for pagination
        const totalItems = await this.conversationThreadRepository.count({ where });

        // Fetch threads with pagination and sorting
        const threads = await this.conversationThreadRepository.findMany({
            where,
            include: {
                userA: { include: { profile: true } },
                userB: { include: { profile: true } },
                group: true,
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { [sortBy]: sortOrder },
            skip,
            take
        });

        let result: ConversationThreadList[] = [];

        if (type === 'ALL') {
            result = threads.map(thread => {
                if (thread.type === 'PRIVATE') {
                    const isUserA = thread.userAId === userId;
                    const unreadCount = thread.messages.filter(message => {
                        return isUserA ? message.receiverId === userId && !message.isRead : message.senderId === userId && !message.isRead;
                    }).length;
                    const interlocutor = isUserA ? thread.userB : thread.userA;

                    if (!interlocutor?.id || !interlocutor?.username) {
                        return undefined;
                    }
                    const { id, username, profile } = interlocutor;
                    return ConversationThreadList.fromConversationThread(
                        thread,
                        { id, username, avatar: profile?.avatar },
                        undefined,
                        thread.messages[0],
                        thread.messages[0]?.createdAt ?? null,
                        unreadCount
                    );
                } else {
                    const group = {
                        name: thread.group?.name ?? '',
                        avatar: thread.group?.avatar ?? null
                    }
                    const unreadCount = thread.messages.filter(message => {
                        return message.receiverId === userId && !message.isRead;
                    }).length;
                    return {
                        ...thread,
                        group,
                        lastMessage: thread.messages[0],
                        updatedAt: thread.messages[0]?.createdAt ?? new Date(),
                        unreadCount
                    };
                }
            }).filter((item): item is ConversationThreadList => !!item);
        } else {
            result = threads
                .map(thread => {
                    if (thread.type === 'PRIVATE') {
                        const isUserA = thread.userAId === userId;
                        const unreadCount = thread.messages.filter(message => {
                            return isUserA ? message.receiverId === userId && !message.isRead : message.senderId === userId && !message.isRead;
                        }).length;
                        const interlocutor = isUserA ? thread.userB : thread.userA;

                        if (!interlocutor?.id || !interlocutor?.username) {
                            return undefined;
                        }
                        const { id, username, profile } = interlocutor;
                        return ConversationThreadList.fromConversationThread(
                            thread,
                            { id, username, avatar: profile?.avatar },
                            undefined,
                            thread.messages[0],
                            thread.messages[0]?.createdAt ?? null,
                            unreadCount
                        );
                    } else {
                        const group = {
                            name: thread.group?.name ?? '',
                            avatar: thread.group?.avatar ?? null
                        }
                        const unreadCount = thread.messages.filter(message => {
                            return message.receiverId === userId && !message.isRead;
                        }).length;
                        return {
                            ...thread,
                            group,
                            lastMessage: thread.messages[0],
                            updatedAt: thread.messages[0]?.createdAt ?? new Date(),
                            unreadCount
                        };
                    }
                })
                .filter((item): item is ConversationThreadList => !!item);
        }

        const meta = {
            totalItems,
            totalPages: Math.ceil(totalItems / pageSize),
            page,
            pageSize,
            hasNextPage: skip + take < totalItems,
            hasPreviousPage: skip > 0
        };
        return {
            items: result,
            meta
        };
    }

    static async getConversationThreadById(threadId: string, userId: string, queryParams: ConversationQueryParams): Promise<PaginatedData<ConversationThreadMessages> | null> {
        const { sortBy = "updatedAt", sortOrder = "desc", page = 1, pageSize = 10, search, ...rest } = queryParams;
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const where: any = {
            id: threadId,
            OR: [
                { userAId: userId },
                { userBId: userId },
            ],
        };

        if (search) {
            where.OR = [
                ...where.OR,
                {
                    message: {
                        content: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                }
            ];
        }
        const totalItems = await this.conversationRepository.count({ where });

        const thread = await this.conversationThreadRepository.findUnique({
            where: { id: threadId },
            include: {
                userA: { include: { profile: true } },
                userB: { include: { profile: true } },
                group: true,
                messages: {
                    orderBy: { [sortBy]: sortOrder },
                    skip,
                    take,
                }
            }
        });

        const meta = {
            totalItems,
            totalPages: Math.ceil(totalItems / pageSize),
            page,
            pageSize,
            hasNextPage: skip + take < totalItems,
            hasPreviousPage: skip > 0
        };

        if (!thread) {
            return null;
        }

        const isUserA = thread.userAId === userId;
        const interlocutorUser = isUserA ? thread.userB : thread.userA;

        if (!interlocutorUser?.id || !interlocutorUser?.username) {
            return null;
        }

        const interlocutor = {
            id: interlocutorUser.id,
            username: interlocutorUser.username,
            avatar: interlocutorUser.profile?.avatar
        };

        return {
            items: ConversationThreadMessages.fromConversationThread(
                thread,
                interlocutor,
                thread.group ? { name: thread.group.name ?? '', avatar: thread.group.avatar } : undefined,
                thread.messages,
            ),
            meta
        };
    }

    static async createConversationThread(req: ConversationThreadRequest): Promise<ConversationThreadList> {
        req = conversationThreadSchema.parse(req);
        const existingThread = await this.conversationThreadRepository.findFirst({
            where: {
                OR: [
                    { userAId: req.userAId, userBId: req.userBId, type: 'PRIVATE' },
                    { groupId: req.groupId, type: 'GROUP' }
                ]
            },
            include: {
                userA: { include: { profile: true } },
                userB: { include: { profile: true } },
                group: true,
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        if (existingThread) {
            // Return the existing thread in the correct format
            let interlocutor;
            if (existingThread.type === 'PRIVATE') {
                const isUserA = existingThread.userAId === req.userAId;
                const user = isUserA ? existingThread.userB : existingThread.userA;
                interlocutor = user
                    ? { id: user.id, username: user.username, avatar: user.profile?.avatar }
                    : undefined;
            }
            const group = existingThread.type === 'GROUP' && existingThread.group
                ? { name: existingThread.group.name ?? '', avatar: existingThread.group.avatar }
                : undefined;
            return ConversationThreadList.fromConversationThread(
                existingThread,
                interlocutor,
                group,
                existingThread.messages[0],
                existingThread.messages[0]?.createdAt ?? null,
                0
            );
        }

        let thread;
        if (req.type === 'PRIVATE' && req.userAId && req.userBId) {
            // Validate both users exist
            const userA = await this.userRepository.findUnique({ where: { id: req.userAId }, include: { profile: true } });
            const userB = await this.userRepository.findUnique({ where: { id: req.userBId }, include: { profile: true } });
            if (!userA || !userB) {
                throw new Error("User not found");
            }
            thread = await this.conversationThreadRepository.create({
                data: {
                    userAId: req.userAId,
                    userBId: req.userBId,
                    type: req.type,
                },
                include: {
                    userA: { include: { profile: true } },
                    userB: { include: { profile: true } },
                    group: true,
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    }
                }
            });
            const interlocutor = { id: userB.id, username: userB.username, avatar: userB?.profile?.avatar };
            return ConversationThreadList.fromConversationThread(
                thread,
                interlocutor,
                undefined,
                thread.messages[0],
                thread.messages[0]?.createdAt ?? null,
                0
            );
        } else if (req.type === 'GROUP' && req.groupId) {
            // Validate group exists
            const group = await this.groupRepository.findUnique({ where: { id: req.groupId } });
            if (!group) {
                throw new Error("Group not found");
            }
            thread = await this.conversationThreadRepository.create({
                data: {
                    groupId: req.groupId,
                    type: req.type,
                },
                include: {
                    userA: { include: { profile: true } },
                    userB: { include: { profile: true } },
                    group: true,
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    }
                }
            });
            const groupInfo = { name: group.name ?? '', avatar: group.avatar };
            return ConversationThreadList.fromConversationThread(
                thread,
                undefined,
                groupInfo,
                thread.messages[0],
                thread.messages[0]?.createdAt ?? null,
                0
            );
        } else {
            throw new Error("Invalid request data for creating conversation thread");
        }
    }

    static async deleteConversationThread(threadId: string, userId: string): Promise<void> {
        const thread = await this.conversationThreadRepository.findUnique({
            where: { id: threadId },
            include: {
                userA: true,
                userB: true,
                group: true
            }
        });

        if (!thread) {
            throw new Error("Conversation thread not found");
        }

        if (thread.userAId !== userId && thread.userBId !== userId) {
            throw new Error("You do not have permission to delete this conversation thread");
        }

        await this.conversationThreadRepository.update({
            where: { id: threadId },
            data: {
                isDeletedByUserA: thread.userAId === userId,
                isDeletedByUserB: thread.userBId === userId
            }
        });
    }

}