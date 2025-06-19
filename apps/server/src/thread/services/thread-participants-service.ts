import { prismaClient } from "@messanger/prisma";
import {
    ThreadList, ThreadModelMapper, ThreadParticipantModelMapper,
    ThreadParticipantPublic,
    threadParticipantSchema,
    ThreadParticipantsRequest,
    ThreadRequest, threadSchema, UserProfileThread
} from "@messanger/types";
import {
    PaginatedData, PaginationMeta, ConversationQueryParams
} from "@messanger/types";
import { ThreadParticipant } from "@prisma/client";


export class ThreadParticipantService {
    private static threadParticipantRepository = prismaClient.threadParticipant;
    private static threadRepository = prismaClient.thread;
    private static userRepository = prismaClient.user;
    private static conversationRepository = prismaClient.conversation;

    static async getThreadParticipantsByThreadId(
        threadId: string,
        userId: string,
        queryParams: ConversationQueryParams
    ): Promise<PaginatedData<ThreadParticipantPublic>> {
        const { sortBy = 'createdAt', sortOrder = 'desc', page = 1, pageSize = 10, search, ...rest } = queryParams;
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const where: any = {
            threadId,
            userId,
            isDeleted: false,
        };

        if (search) {
            where.OR = [
                { thread: { name: { contains: search, mode: 'insensitive' } } },
                { user: { username: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const totalItems = await this.threadParticipantRepository.count({ where });
        const threadParticipants = await this.threadParticipantRepository.findMany({
            where: { threadId, userId, isDeleted: false },
            include: {
                user: {
                    include: { profile: true }
                },
            },
            orderBy: { [sortBy]: sortOrder },
            skip,
            take,
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


        const meta: PaginationMeta = {
            totalItems,
            totalPages: Math.ceil(totalItems / pageSize),
            page,
            pageSize,
            hasNextPage: skip + take < totalItems,
            hasPreviousPage: skip > 0,
        };

        return {
            thread: ThreadModelMapper.fromThreadToThreadPublic({
                ...thread,
                creator: {
                    ...thread.creator,
                    profile: thread.creator.profile === null ? undefined : thread.creator.profile,
                },
            }),
            items: threadParticipants.map(participant =>
                ThreadParticipantModelMapper.fromThreadParticipantToThreadParticipantPublic({
                    ...participant,
                    user: participant.user ? {
                        ...participant.user,
                    } : undefined,
                })
            ),
            meta
        };
    }

    // Todo : We can use getProfiles
    // static async getThreadById(threadId: string, userId: string, queryParams: ConversationQueryParams): Promise<PaginatedData<ThreadConversationList | null>> {
    //     const { sortBy = 'updatedAt', sortOrder = 'desc', page = 1, pageSize = 10, search, ...rest } = queryParams;
    //     const skip = (page - 1) * pageSize;
    //     const take = pageSize;

    //     const where: any = {
    //         id: threadId,
    //         isDeleted: false,
    //         threadParticipants: {
    //             some: {
    //                 userId,
    //                 isDeleted: false,
    //             },
    //         },
    //         orderBy: {
    //             [sortBy]: sortOrder,
    //         },
    //         skip,
    //         take,
    //     };
    //     if (search) {
    //         where.OR = [
    //             { title: { contains: search, mode: 'insensitive' } },
    //             { messages: { some: { content: { contains: search, mode: 'insensitive' } } } },
    //         ];
    //     }

    //     const totalItems = await this.conversationRepository.count({
    //         where: {
    //             threadId,
    //             isDeleted: false,
    //             content: search ? { contains: search, mode: 'insensitive' } : undefined,
    //         },
    //     });

    //     const totalPages = Math.ceil(totalItems / pageSize);
    //     const hasNextPage = skip + take < totalItems;
    //     const hasPreviousPage = skip > 0;
    //     const conversations = await this.conversationRepository.findMany({
    //         where: {
    //             threadId,
    //             isDeleted: false,
    //             content: search ? { contains: search, mode: 'insensitive' } : undefined,
    //         },
    //         skip,
    //         take,
    //         orderBy: { [sortBy]: sortOrder },
    //         include: {
    //             sender: {
    //                 include: { profile: true }
    //             },
    //         },
    //     });

    //     const thread = await this.threadRepository.findUnique({
    //         where: { id: threadId },
    //         include: {
    //             creator: {
    //                 include: { profile: true }
    //             },
    //             participants: {
    //                 where: { isDeleted: false },
    //                 include: { user: true },
    //             },
    //         },
    //     });

    //     const unreadCount = await this.threadParticipantRepository.count({
    //         where: {
    //             threadId: thread?.id,
    //             userId,
    //             isRead: false,
    //         },
    //     });

    //     const meta: PaginationMeta = {
    //         totalItems,
    //         totalPages,
    //         page,
    //         pageSize,
    //         hasNextPage,
    //         hasPreviousPage,
    //     };

    //     return {
    //         thread,
    //         items: ThreadModelMapper.fromThreadToThreadConversationList(
    //             conversations,
    //         ),
    //         meta
    //     };
    // }

    static async addNewParticipants(
        req: ThreadParticipantsRequest,
        threadId: string,
        userId: string
    ): Promise<ThreadParticipantPublic> {
        // Check if the user is authorized (creator or participant)
        const thread = await this.threadRepository.findFirst({
            where: { id: threadId, creatorId: userId }
        });
        if (!thread) {
            throw new Error("You are not authorized to add participants to this thread.");
        }

        // Check if the participant already exists
        const exists = await this.threadParticipantRepository.findFirst({
            where: { threadId, userId: req.participantId, isDeleted: false }
        });
        if (exists) {
            throw new Error("This participant is already added to the thread.");
        }

        // Check if the user exists
        const user = await this.userRepository.findUnique({
            where: { id: req.participantId },
            include: { profile: true }
        });
        if (!user) {
            throw new Error("This participant does not exist.");
        }

        // Add participant
        const participant = await this.threadParticipantRepository.create({
            data: { threadId, userId: req.participantId }
        });

        return ThreadParticipantModelMapper.fromThreadParticipantToThreadParticipantPublic(participant);
    }

    static async updateParticipant(
        threadId: string,
        userId: string,
        req: ThreadParticipantsRequest,
    ): Promise<ThreadParticipantPublic | null> {
        const validatedData = threadParticipantSchema.parse(req);
        // Check if the user is authorized (creator or participant)
        const thread = await this.threadRepository.findFirst({
            where: { id: threadId, creatorId: userId }
        });
        if (!thread) {
            throw new Error("You are not authorized to update participants in this thread.");
        }

        // Update participant
        const participant = await this.threadParticipantRepository.update({
            where: { id: validatedData.participantId, threadId },
            data: { isRead: validatedData.isRead, isDeleted: validatedData.isDeleted },
        });

        return ThreadParticipantModelMapper.fromThreadParticipantToThreadParticipantPublic(participant);
    }


}