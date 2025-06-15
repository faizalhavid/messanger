import { prismaClient } from '@messanger/prisma';
import { ConversationPublic, ConversationQueryParams, ConversationThreadList, ConversationThreadMessages, ConversationThreadRequest, conversationThreadSchema, PaginatedData } from '@messanger/types';
import { Conversation } from '@prisma/client';

export class ConversationThreadService {
  private static conversationThreadRepository = prismaClient.conversationThread;
  private static conversationRepository = prismaClient.conversation;
  private static userRepository = prismaClient.user;
  private static groupRepository = prismaClient.conversationGroup;

  static async getConversationThreads(userId: string, queryParams: ConversationQueryParams): Promise<PaginatedData<ConversationThreadList>> {
    const { sortBy = 'createdAt', sortOrder = 'desc', page = 1, pageSize = 10, search, type = 'ALL' } = queryParams;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: any = {
      OR: [{ interlocutorId: userId }],
    };

    if (type !== 'ALL') where.type = type;

    if (search) {
      where.OR = [
        ...where.OR,
        {
          group: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    const totalItems = await this.conversationThreadRepository.count({ where });

    const threads = await this.conversationThreadRepository.findMany({
      where,
      include: {
        interlocutor: { include: { profile: true } },
        group: true,
        messages: {
          orderBy: { [sortBy]: sortOrder },
          take: 1,
        },
      },
      skip,
      take,
    });

    const result = (
      await Promise.all(
        threads.map(async (thread) => {
          const { interlocutor, messages, ...data } = thread;

          if (!interlocutor?.id || !interlocutor?.username) return undefined;
          const unreadCount = await this.conversationRepository.count({
            where: {
              conversationThreadId: thread.id,
              isRead: false,
            },
          });
          const group = { name: thread.group?.name ?? '', avatar: thread.group?.avatar ?? null };

          if (thread.type === 'PRIVATE') {
            return ConversationThreadList.fromConversationThread(data, { id: interlocutor.id, username: interlocutor.username, avatar: interlocutor.profile?.avatar }, undefined, thread.messages[0], unreadCount);
          } else {
            return ConversationThreadList.fromConversationThread(data, undefined, group, thread.messages[0], unreadCount);
          }
        })
      )
    ).filter((item): item is ConversationThreadList => !!item);

    const meta = {
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      page,
      pageSize,
      hasNextPage: skip + take < totalItems,
      hasPreviousPage: skip > 0,
    };

    return { items: result, meta };
  }

  static async getConversationThreadById(threadId: string, userId: string, queryParams: ConversationQueryParams): Promise<PaginatedData<Conversation> | null> {
    const { sortBy = 'updatedAt', sortOrder = 'desc', page = 1, pageSize = 10, search, ...rest } = queryParams;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: any = {
      id: threadId,
      OR: [
        { interlocutorId: userId }, // user login sebagai penerima, interlocutor sebagai pengirim],
      ],
    };

    if (search) {
      where.OR = [
        ...where.OR,
        {
          message: {
            where: {
              OR: [{ isDeletedBySender: false }, { isDeletedByReceiver: false }],
            },
            content: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }
    const totalItems = await this.conversationThreadRepository.count({ where });

    const thread = await this.conversationThreadRepository.findUnique({
      where: {
        id: threadId,
        OR: [{ isDeletedByInterlocutor: false, isDeletedByUser: false }],
      },
      include: {
        interlocutor: { include: { profile: true } },
        group: true,
        messages: {
          orderBy: { [sortBy]: sortOrder },
          skip,
          take,
        },
      },
    });

    const meta = {
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      page,
      pageSize,
      hasNextPage: skip + take < totalItems,
      hasPreviousPage: skip > 0,
    };

    if (!thread) {
      return null;
    }

    let { interlocutor, group, messages, ...threadData } = thread;
    const interlocutorInfo = {
      id: thread.interlocutor?.id ?? '',
      username: thread.interlocutor?.username ?? '',
      avatar: thread.interlocutor?.profile?.avatar ?? null,
    };

    const unreadCount = await this.conversationRepository.count({
      where: {
        conversationThreadId: thread.id,
        isRead: false,
      },
    });

    return {
      thread: {
        ...threadData,
        interlocutor: interlocutorInfo,
        group: group ? { name: group.name ?? '', avatar: group.avatar ?? null } : undefined,
        lastMessage: thread.messages[0],
        updatedAt: thread.messages[0]?.createdAt ?? new Date(),
        unreadCount,
      } as ConversationThreadList,
      items: thread.messages,
      meta,
    };
  }

  static async createConversationThread(req: ConversationThreadRequest, userId: string): Promise<ConversationThreadList> {
    req.userId = userId;
    req = conversationThreadSchema.parse(req);

    if (req.type === 'PRIVATE') {
      req.userId = userId;
    }

    const existingThread = await this.conversationThreadRepository.findFirst({
      where:
        req.type === 'PRIVATE'
          ? {
              OR: [
                { interlocutorId: req.interlocutorId }, // user login sebagai pengirim, interlocutor sebagai penerima
                { interlocutorId: userId }, // user login sebagai penerima, interlocutor sebagai pengirim
              ],
            }
          : { groupId: req.groupId, type: 'GROUP' },
      include: {
        interlocutor: { include: { profile: true } },
        group: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const unreadCount = await this.conversationRepository.count({
      where: {
        conversationThreadId: existingThread?.id,
        isRead: false,
      },
    });
    if (existingThread) {
      const group = existingThread.type === 'GROUP' && existingThread.group ? { name: existingThread.group.name ?? '', avatar: existingThread.group.avatar } : undefined;
      return ConversationThreadList.fromConversationThread(existingThread, existingThread.interlocutor ?? undefined, group, existingThread.messages[0], unreadCount);
    }

    let thread;
    if (req.type === 'PRIVATE' && req.userId && req.interlocutorId) {
      // Validate both users exist
      const userA = await this.userRepository.findUnique({ where: { id: req.userId }, include: { profile: true } });
      const userB = await this.userRepository.findUnique({ where: { id: req.interlocutorId }, include: { profile: true } });
      if (!userA || !userB) {
        throw new Error('User not found');
      }
      thread = await this.conversationThreadRepository.create({
        data: {
          userBId: req.interlocutorId,
          type: req.type,
        },
        include: {
          // userA: { include: { profile: true } },
          // userB: { include: { profile: true } },
          group: true,
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });
      // interlocutor is always the other user
      const interlocutor = { id: userB.id, username: userB.username, avatar: userB?.profile?.avatar };
      const isUserA = thread.userAId === userId;
      const unreadCount = thread.messages.filter((message) => {
        return isUserA ? message.receiverId === userId && !message.isRead : message.senderId === userId && !message.isRead;
      }).length;
      return ConversationThreadList.fromConversationThread(thread, interlocutor, undefined, thread.messages[0], unreadCount);
    } else if (req.type === 'GROUP' && req.groupId) {
      // Validate group exists
      const group = await this.groupRepository.findUnique({ where: { id: req.groupId } });
      if (!group) {
        throw new Error('Group not found');
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
            take: 1,
          },
        },
      });
      const groupInfo = { name: group.name ?? '', avatar: group.avatar };
      return ConversationThreadList.fromConversationThread(thread, undefined, groupInfo, thread.messages[0]);
    } else {
      throw new Error('Invalid request data for creating conversation thread');
    }
  }

  static async deleteConversationThread(threadId: string, userId: string): Promise<void> {
    const thread = await this.conversationThreadRepository.findUnique({
      where: { id: threadId },
      include: {
        userA: true,
        userB: true,
        group: true,
      },
    });

    if (!thread) {
      throw new Error('Conversation thread not found');
    }

    if (thread.userAId !== userId && thread.userBId !== userId) {
      throw new Error('You do not have permission to delete this conversation thread');
    }

    await this.conversationThreadRepository.update({
      where: { id: threadId },
      data: {
        isDeletedByUserA: thread.userAId === userId,
        isDeletedByUserB: thread.userBId === userId,
      },
    });
  }
}
