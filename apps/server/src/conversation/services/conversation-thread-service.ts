import { prismaClient } from "@messanger/prisma";
import { ConversationPublic, ConversationQueryParams, ConversationThreadList, ConversationThreadMessages, ConversationThreadRequest, conversationThreadSchema, PaginatedData } from "@messanger/types";
import { Conversation } from "@prisma/client";



export class ConversationThreadService {
    private static conversationThreadRepository = prismaClient.conversationThread;
    private static conversationRepository = prismaClient.conversation;
    private static userRepository = prismaClient.user;
    private static groupRepository = prismaClient.conversationGroup;

    static async getConversationThreads(userId: string, queryParams: ConversationQueryParams): Promise<PaginatedData<ConversationThreadList>> {
        const { sortBy = "createdAt", sortOrder = "desc", page = 1, pageSize = 10, search, type = 'ALL' } = queryParams;
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const where: any = {
            OR: [
                { userAId: userId },
                { userBId: userId },
            ]
        };

        if (type !== 'ALL') where.type = type;

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

        const totalItems = await this.conversationThreadRepository.count({ where });

        const threads = await this.conversationThreadRepository.findMany({
            where,
            include: {
                userA: { include: { profile: true } },
                userB: { include: { profile: true } },
                group: true,
                messages: {
                    orderBy: { [sortBy]: sortOrder },
                    take: 1
                }
            },
            skip,
            take
        });



        const result = (await Promise.all(threads.map(async thread => {
            const { userA, userB, messages, ...data } = thread;
            const isUserA = thread.userAId === userId;
            const interlocutor = isUserA ? thread.userB : thread.userA;
            if (!interlocutor?.id || !interlocutor?.username) return undefined;
            const unreadCount = await this.conversationRepository.count({
                where: {
                    conversationThreadId: thread.id,
                    isRead: false,
                }
            });
            const group = { name: thread.group?.name ?? '', avatar: thread.group?.avatar ?? null };

            if (thread.type === 'PRIVATE') {
                return ConversationThreadList.fromConversationThread(
                    data,
                    { id: interlocutor.id, username: interlocutor.username, avatar: interlocutor.profile?.avatar },
                    undefined,
                    thread.messages[0],
                    unreadCount
                );
            } else {
                return ConversationThreadList.fromConversationThread(
                    data,
                    undefined,
                    group,
                    thread.messages[0],
                    unreadCount
                );
            }
        }))).filter((item): item is ConversationThreadList => !!item);

        const meta = {
            totalItems,
            totalPages: Math.ceil(totalItems / pageSize),
            page,
            pageSize,
            hasNextPage: skip + take < totalItems,
            hasPreviousPage: skip > 0
        };

        return { items: result, meta };
    }

    static async getConversationThreadById(threadId: string, userId: string, queryParams: ConversationQueryParams): Promise<PaginatedData<Conversation> | null> {
        const { sortBy = "updatedAt", sortOrder = "desc", page = 1, pageSize = 10, search, ...rest } = queryParams;
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const where: any = {
            id: threadId,
            OR: [
                { userAId: "id-test1" },
                { userBId: "id-test1" }
            ]
        };

        if (search) {
            where.OR = [
                ...where.OR,
                {
                    message: {
                        where: {
                            OR: [
                                { isDeletedBySender: false },
                                { isDeletedByReceiver: false }
                            ]
                        },
                        content: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                }
            ];
        }
        const totalItems = await this.conversationThreadRepository.count({ where });

        const thread = await this.conversationThreadRepository.findUnique({
            where: {
                id: threadId,
                OR: [
                    {
                        userAId: userId,
                        isDeletedByUserA: false
                    },
                    {
                        userBId: userId,
                        isDeletedByUserB: false
                    }
                ]
            },
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
        const { userA, userB, group, messages, ...threadData } = thread;
        return {
            thread: {
                ...threadData,
                interlocutor: {
                    id: interlocutor.id,
                    username: interlocutor.username,
                    avatar: interlocutor.avatar ?? null
                },
                group: group ? { name: group.name ?? '', avatar: group.avatar ?? null } : undefined,
                lastMessage: thread.messages[0],
                updatedAt: thread.messages[0]?.createdAt ?? new Date(),
                unreadCount: thread.messages.filter(m => isUserA ? m.receiverId === userId && !m.isRead : m.senderId === userId && !m.isRead).length
            } as ConversationThreadList,
            items: thread.messages,
            meta
        };
    }

    static async createConversationThread(req: ConversationThreadRequest, userId: string): Promise<ConversationThreadList> {
        req.userAId = userId;
        req = conversationThreadSchema.parse(req);

        if (req.type === 'PRIVATE') {
            req.userAId = userId;
        }

        const existingThread = await this.conversationThreadRepository.findFirst({
            where: req.type === 'PRIVATE'
                ? {
                    OR: [
                        { userAId: req.userAId, userBId: req.userBId, type: 'PRIVATE' },
                        { userAId: req.userBId, userBId: req.userAId, type: 'PRIVATE' }
                    ]
                }
                : { groupId: req.groupId, type: 'GROUP' },
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
            let interlocutor;
            if (existingThread.type === 'PRIVATE') {
                const isUserA = existingThread.userAId === userId;
                const user = isUserA ? existingThread.userB : existingThread.userA;
                interlocutor = user
                    ? { id: user.id, username: user.username, avatar: user.profile?.avatar }
                    : undefined;
            }
            const group = existingThread.type === 'GROUP' && existingThread.group
                ? { name: existingThread.group.name ?? '', avatar: existingThread.group.avatar }
                : undefined;
            const isUserA = existingThread.userAId === userId;
            const unreadCount = existingThread.messages.filter(message => {
                return isUserA ? message.receiverId === userId && !message.isRead : message.senderId === userId && !message.isRead;
            }).length;
            return ConversationThreadList.fromConversationThread(
                existingThread,
                interlocutor,
                group,
                existingThread.messages[0],
                unreadCount
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
                    // userA: { include: { profile: true } },
                    // userB: { include: { profile: true } },
                    group: true,
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    }
                }
            });
            // interlocutor is always the other user
            const interlocutor = { id: userB.id, username: userB.username, avatar: userB?.profile?.avatar };
            const isUserA = thread.userAId === userId;
            const unreadCount = thread.messages.filter(message => {
                return isUserA ? message.receiverId === userId && !message.isRead : message.senderId === userId && !message.isRead;
            }).length;
            return ConversationThreadList.fromConversationThread(
                thread,
                interlocutor,
                undefined,
                thread.messages[0],
                unreadCount
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
                thread.messages[0]
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