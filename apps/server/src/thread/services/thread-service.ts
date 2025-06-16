import { prismaClient } from "@messanger/prisma";
import { fileTypeSchema, ImageType, imageTypeSchema, ThreadList, ThreadModelMapper, ThreadRequest, threadSchema } from "@messanger/types";
import {
    PaginatedData, PaginationMeta,
    ThreadConversationList, ConversationQueryParams
} from "@messanger/types";


export class ThreadService {
    private static threadRepository = prismaClient.thread;
    private static threadParticipantRepository = prismaClient.threadParticipant;
    private static conversationRepository = prismaClient.conversation;

    static async getThreads(userId: string, queryParams: ConversationQueryParams): Promise<PaginatedData<ThreadList>> {
        const { sortBy = 'createdAt', sortOrder = 'desc', page = 1, pageSize = 10, search, ...rest } = queryParams;
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const where: any = {
            OR: [
                { creatorId: userId },
                { participants: { some: { userId, isDeleted: false } } }
            ],
            isDeleted: false,
        }

        if (search) {
            where.OR = [
                ...where.OR,
                { title: { contains: search, mode: 'insensitive' } },
            ];
        }

        const totalItems = await this.threadRepository.count({
            where,
        });

        const threads = await this.threadRepository.findMany({
            where,
            skip,
            take,
            orderBy: { [sortBy]: sortOrder },
            include: {
                creator: {
                    include: { profile: true }
                },
                messages: {
                    include: { sender: { include: { profile: true } } },
                },
                participants: {
                    where: { isDeleted: false },
                    include: { user: true },
                },
            },
        });



        const meta: PaginationMeta = {
            totalItems,
            totalPages: Math.ceil(totalItems / pageSize),
            page,
            pageSize,
            hasNextPage: skip + take < totalItems,
            hasPreviousPage: skip > 0,
        }

        const unreadCounts = await this.threadParticipantRepository.groupBy({
            by: ['threadId'],
            _count: {
                isRead: true,
            },
            where: {
                userId,
                isDeleted: false,
            },
        });

        const result = threads.map(thread => {
            const { messages, ...restThread } = thread;
            const lastConversation = messages[messages.length - 1];
            const unreadCount = unreadCounts.find(count => count.threadId === thread.id)?._count.isRead || 0;
            return ThreadModelMapper.fromThreadToThreadList(
                {
                    ...restThread,
                    creator: thread.creator
                        ? {
                            ...thread.creator,
                            profile: thread.creator.profile === null ? undefined : thread.creator.profile,
                        }
                        : undefined,
                },
                {
                    ...lastConversation,
                    sender: lastConversation.sender.profile ?? undefined,
                }
                unreadCount,
                thread.participants.map(p => p.user),
            );
        });

        return {
            items: result,
            meta
        };
    }

    static async getThreadConversations(
        threadId: string,
        userId: string,
        queryParams: ConversationQueryParams
    ): Promise<PaginatedData<ThreadConversationList | null>> {
        const { sortBy = 'updatedAt', sortOrder = 'desc', page = 1, pageSize = 10, search, ...rest } = queryParams;
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const where: any = {
            id: threadId,
            isDeleted: false,
            threadParticipants: {
                some: {
                    userId,
                    isDeleted: false,
                },
            },
            orderBy: {
                [sortBy]: sortOrder,
            },
            skip,
            take,
        };
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { messages: { some: { content: { contains: search, mode: 'insensitive' } } } },
            ];
        }

        const totalItems = await this.conversationRepository.count({
            where: {
                threadId,
                isDeleted: false,
                content: search ? { contains: search, mode: 'insensitive' } : undefined,
            },
        });

        const totalPages = Math.ceil(totalItems / pageSize);
        const hasNextPage = skip + take < totalItems;
        const hasPreviousPage = skip > 0;
        const conversations = await this.conversationRepository.findMany({
            where: {
                threadId,
                isDeleted: false,
                content: search ? { contains: search, mode: 'insensitive' } : undefined,
            },
            skip,
            take,
            orderBy: { [sortBy]: sortOrder },
            include: {
                sender: {
                    include: { profile: true }
                },
            },
        });

        const thread = await this.threadRepository.findUnique({
            where: { id: threadId },
            include: {
                creator: {
                    include: { profile: true }
                },
            },
            // participants: {
            //     where: { isDeleted: false },
            //     include: { user: { include: { profile: true } } },
            // },
        });

        if (!thread) {
            throw new Error("Thread not found or you do not have access to it.");
        }

        // const unreadCount = await this.threadParticipantRepository.count({
        //     where: {
        //         threadId: thread?.id,
        //         userId,
        //         isRead: false,
        //     },
        // });

        const meta: PaginationMeta = {
            totalItems,
            totalPages,
            page,
            pageSize,
            hasNextPage,
            hasPreviousPage,
        };

        return {
            thread: ThreadModelMapper.fromThreadToThreadPublic({
                ...thread,
                creator: {
                    ...thread.creator,
                    profile: thread.creator.profile === null ? undefined : thread.creator.profile,
                },
            }),
            items: ThreadModelMapper.fromThreadToThreadConversationList(
                conversations,

            ),
            meta
        };
    }

    static async createThread(
        req: ThreadRequest,
        userId: string
    ): Promise<ThreadList> {
        const validatedData = threadSchema.parse({
            ...req,
            creatorId: userId
        });
        const { creatorId, type, participantIds, name } = validatedData;

        // Ensure participantIds is an array and includes the sender
        const uniqueParticipantIds = Array.from(new Set([...(participantIds || []), userId]));

        // Validation based on type
        if (type === 'PRIVATE') {
            if (uniqueParticipantIds.length !== 2) {
                throw new Error("A private thread must have exactly 2 participants (including the sender).");
            }
        } else {
            if (uniqueParticipantIds.length < 2) {
                throw new Error("A group thread must have at least 2 participants (including the sender).");
            }
        }

        const thread = await this.threadRepository.create({
            data: {
                name: name || 'New Thread',
                creatorId: creatorId || userId,
                type: type || 'PRIVATE',
                participants: {
                    create: uniqueParticipantIds.map(id => ({
                        userId: id,
                        isDeleted: false,
                    }))
                },
                isDeleted: false,
            },
            include: {
                creator: {
                    include: { profile: true }
                },
                participants: {
                    where: { isDeleted: false },
                    include: { user: true },
                },
            },
        });

        return ThreadModelMapper.fromThreadToThreadList(
            {
                ...thread,
                creator: thread.creator
                    ? {
                        ...thread.creator,
                        profile: thread.creator.profile === null ? undefined : thread.creator.profile,
                    }
                    : undefined,
            },
            undefined,
            undefined,
            thread.participants.map(p => p.user),
        );
    }

    static async updateThread(
        req: ThreadRequest,
        threadId: string,
        userId: string
    ): Promise<ThreadList | null> {
        const validatedData = threadSchema.parse(req);
        const { name, participantIds } = validatedData;

        const thread = await this.threadRepository.update({
            where: { id: threadId, creatorId: userId },
            data: {
                name,
                participants: {
                    set: Array.from(new Set([...(participantIds || []), userId])).map(id => ({
                        threadId_userId: {
                            threadId: threadId,
                            userId: id
                        }
                    }))
                },
            },
            include: {
                creator: {
                    include: { profile: true }
                },
                participants: {
                    where: { isDeleted: false },
                    include: { user: true },
                },
            },
        });

        return ThreadModelMapper.fromThreadToThreadList(
            {
                ...thread,
                creator: {
                    ...thread.creator,
                    profile: thread.creator.profile === null ? undefined : thread.creator.profile,
                },

            }
        );
    }

    static async uploadThreadAvatar(
        threadId: string,
        userId: string,
        file: ImageType
    ): Promise<ThreadList | null> {
        const validatedFile = imageTypeSchema.parse(file);

        const thread = await this.threadRepository.update({
            where: { id: threadId, creatorId: userId },
            data: {
                avatar: validatedFile.url,
            },
            include: {
                creator: {
                    include: { profile: true }
                },
                participants: {
                    where: { isDeleted: false },
                    include: { user: true },
                },
            },
        });

        return ThreadModelMapper.fromThreadToThreadList(
            {
                ...thread,
                creator: {
                    ...thread.creator,
                    profile: thread.creator.profile === null ? undefined : thread.creator.profile,
                },
            }
        );
    }

    static async deleteThread(threadId: string, userId: string): Promise<ThreadList | null> {
        const thread = await this.threadRepository.update({
            where: { id: threadId, creatorId: userId },
            data: {
                isDeleted: true,
                participants: {
                    updateMany: {
                        where: { userId },
                        data: { isDeleted: true }
                    }
                }
            },
            include: {
                creator: {
                    include: { profile: true }
                },
                participants: {
                    where: { isDeleted: false },
                    include: { user: true },
                },
            },
        });

        return ThreadModelMapper.fromThreadToThreadList(
            {
                ...thread,
                creator: {
                    ...thread.creator,
                    profile: thread.creator.profile === null ? undefined : thread.creator.profile,
                },
            }
        );
    }

}