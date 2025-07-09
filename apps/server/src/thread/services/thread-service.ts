import { prismaClient } from '@messanger/prisma';
import { ConversationPublic, fileTypeSchema, ImageType, imageTypeSchema, ThreadList, ThreadModelMapper, ThreadRequest, threadSchema, WsEventName, WsTopic } from '@messanger/types';
import { PaginatedData, PaginationMeta, ThreadConversationList, QueryParamsData } from '@messanger/types';
import { server } from 'src';
import { ConversationStatusService } from 'src/conversation/services/conversation-status-service';
import { generateWSBroadcastPayload } from 'src/websocket/config';

export class ThreadService {
  private static threadRepository = prismaClient.thread;
  private static threadParticipantRepository = prismaClient.threadParticipant;
  private static conversationRepository = prismaClient.conversation;
  private static conversationStatusRepository = prismaClient.conversationStatus;

  static async getAllThreads(userId: string, queryParams: QueryParamsData): Promise<PaginatedData<ThreadList>> {
    const { sortBy = 'createdAt', sortOrder = 'desc', page = 1, pageSize = 10, search, ...rest } = queryParams;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: any = {
      OR: [{ creatorId: userId }, { participants: { some: { userId, isDeleted: false } } }],
      isDeleted: false,
    };

    if (search) {
      where.OR = [...where.OR, { title: { contains: search, mode: 'insensitive' } }];
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
          include: { profile: true },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: { include: { profile: true } },
            // conversationStatus: {
            //     where: { userId, isDeleted: false }
            // },
          },
          where: { conversationStatus: { some: { userId, isDeleted: false } } },
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
    };

    const unreadCounts = await this.conversationStatusRepository.groupBy({
      by: ['conversationId'],
      _count: { conversationId: true },
      where: {
        userId,
        isRead: false,
        conversation: {
          threadId: { in: threads.map((t) => t.id) },
        },
      },
    });

    const result = threads.map((thread) => {
      const { messages, ...restThread } = thread;
      const lastConversation = thread.messages[0];
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
        lastConversation
          ? {
            ...lastConversation,
            sender: lastConversation.sender
              ? {
                ...lastConversation.sender,
                profile: lastConversation.sender.profile ?? undefined,
              }
              : undefined,
          }
          : undefined,
        unreadCounts.find((uc) => uc.conversationId === lastConversation?.id)?._count?.conversationId || 0,
        thread.participants.map((p) => p.user)
      );
    });

    return {
      items: result,
      meta,
    };
  }

  static async getThreadConversations(
    threadId: string,
    userId: string,
    queryParams: QueryParamsData
  ): Promise<PaginatedData<ConversationPublic>> {
    const { sortBy = 'createdAt', sortOrder = 'desc', page = 1, pageSize = 10, search, ...rest } = queryParams;
    const skip = (page - 1) * pageSize;
    const take = parseInt(String(pageSize), 10);

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
      where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { messages: { some: { content: { contains: search, mode: 'insensitive' } } } }];
    }

    const totalItems = await this.conversationRepository.count({
      where: {
        threadId,
        // conversationStatus: {
        //   some: {
        //     userId,
        //     isDeleted: false,
        //   },
        // },
        content: search ? { contains: search, mode: 'insensitive' } : undefined,
      },
    });

    const totalPages = Math.ceil(totalItems / pageSize);
    const hasNextPage = skip + take < totalItems;
    const hasPreviousPage = skip > 0;
    const conversations = await this.conversationRepository.findMany({
      where: {
        threadId,
        // conversationStatus: {
        //   some: {
        //     userId,
        //     isDeleted: false,
        //   },
        // },
        ...(rest?.senderId && { senderId: rest.senderId }),
        isDeletedBySender: false,
        content: search ? { contains: search, mode: 'insensitive' } : undefined,
      },
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
      include: {
        sender: {
          include: { profile: true },
        },
        conversationStatus: {
          where: { userId, isDeleted: false },
          take: 1,
          orderBy: { conversation: { createdAt: 'desc' } },
        },
      },
    });

    const thread = await this.threadRepository.findUnique({
      where: { id: threadId },
      include: {
        creator: {
          include: { profile: true },
        },
      },
      // participants: {
      //     where: { isDeleted: false },
      //     include: { user: { include: { profile: true } } },
      // },
    });

    if (!thread) {
      throw new Error('Thread not found or you do not have access to it.');
    }

    // const unreadCount = await this.threadParticipantRepository.count({
    //     where: {
    //         threadId: thread?.id,
    //         userId,
    //         isRead: false,
    //     },
    // });
    if (conversations.some((c) => c.conversationStatus.some((cs) => !cs.isRead))) {
      const broadcastPayload = generateWSBroadcastPayload<{ threadId: string; userId: string }>({ threadId, userId: userId }, WsEventName.ConversationRead);
      server.publish(WsTopic.Conversations, JSON.stringify(broadcastPayload));
      ConversationStatusService.updateReadStatusForAllConversationInThread(threadId, userId);
    }
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
        conversations.map(({ conversationStatus, ...conversation }) => ({
          ...conversation,
          sender: {
            ...conversation.sender,
            profile: conversation.sender.profile === null ? undefined : conversation.sender.profile,
          },
          status: conversationStatus[0],
        })), undefined
      ).conversations,
      meta,
    };
  }

  static async createThread(req: ThreadRequest, userId: string): Promise<ThreadList> {
    const validatedData = threadSchema.parse({
      ...req,
      creatorId: userId,
    });
    const { creatorId, type, participantIds, name } = validatedData;

    // Ensure participantIds is an array and includes the sender
    const uniqueParticipantIds = Array.from(new Set([...(participantIds || []), userId]));

    // Validation based on type
    if (type === 'PRIVATE') {
      if (uniqueParticipantIds.length !== 2) {
        throw new Error('A private thread must have exactly 2 participants (including the sender).');
      }
    } else {
      if (uniqueParticipantIds.length < 2) {
        throw new Error('A group thread must have at least 2 participants (including the sender).');
      }
    }

    const thread = await this.threadRepository.create({
      data: {
        name: name || 'New Thread',
        creatorId: creatorId || userId,
        type: type || 'PRIVATE',
        participants: {
          create: uniqueParticipantIds.map((id) => ({
            userId: id,
            isDeleted: false,
          })),
        },
        isDeleted: false,
      },
      include: {
        creator: {
          include: { profile: true },
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
      thread.participants.map((p) => p.user)
    );
  }

  static async updateThread(req: ThreadRequest, threadId: string, userId: string): Promise<ThreadList | null> {
    const validatedData = threadSchema.parse(req);
    const { name, participantIds } = validatedData;

    if (participantIds && participantIds.length === 0) {
      throw new Error('Participant IDs cannot be an empty array.');
    }
    const existingThread = await this.threadRepository.findUnique({
      where: { id: threadId },
      select: { type: true },
    });

    if (!existingThread) {
      throw new Error('Thread not found.');
    }

    const uniqueParticipantIds = Array.from(new Set([...(participantIds || []), userId]));

    if (existingThread.type === 'PRIVATE' && uniqueParticipantIds.length > 2) {
      throw new Error('A private thread cannot have more than 2 participants.');
    }

    const thread = await this.threadRepository.update({
      where: { id: threadId, creatorId: userId },
      data: {
        name,
        participants: {
          set: uniqueParticipantIds.map((id) => ({
            threadId_userId: {
              threadId: threadId,
              userId: id,
            },
          })),
        },
      },
      include: {
        creator: {
          include: { profile: true },
        },
        participants: {
          where: { isDeleted: false },
          include: { user: true },
        },
      },
    });

    return ThreadModelMapper.fromThreadToThreadList({
      ...thread,
      creator: {
        ...thread.creator,
        profile: thread.creator.profile === null ? undefined : thread.creator.profile,
      },
    });
  }

  static async uploadThreadAvatar(threadId: string, userId: string, file: ImageType): Promise<ThreadList | null> {
    const validatedFile = imageTypeSchema.parse(file);

    const thread = await this.threadRepository.update({
      where: { id: threadId, creatorId: userId },
      data: {
        avatar: validatedFile.url,
      },
      include: {
        creator: {
          include: { profile: true },
        },
        participants: {
          where: { isDeleted: false },
          include: { user: true },
        },
      },
    });

    return ThreadModelMapper.fromThreadToThreadList({
      ...thread,
      creator: {
        ...thread.creator,
        profile: thread.creator.profile === null ? undefined : thread.creator.profile,
      },
    });
  }

  static async deleteByUserThread(threadId: string, userId: string): Promise<ThreadList | null> {
    const thread = await this.threadRepository.findFirst({
      where: {
        id: threadId,
        isDeleted: false,
        OR: [{ creatorId: userId }, { participants: { some: { userId, isDeleted: false } } }],
      },
      include: {
        creator: { include: { profile: true } },
        participants: { where: { isDeleted: false }, include: { user: true } },
      },
    });

    if (!thread) {
      throw new Error('Thread not found or you do not have access to it.');
    }

    if (thread.creatorId === userId) {
      await this.threadRepository.update({
        where: { id: threadId },
        data: { isDeleted: true },
      });
    } else {
      await this.threadParticipantRepository.updateMany({
        where: { threadId, userId, isDeleted: false },
        data: { isDeleted: true },
      });
    }

    return ThreadModelMapper.fromThreadToThreadList({
      ...thread,
      creator: {
        ...thread.creator,
        profile: thread.creator.profile === null ? undefined : thread.creator.profile,
      },
    });
  }
}
