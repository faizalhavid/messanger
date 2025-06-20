import { send } from 'process';
import { prismaClient } from '@messanger/prisma';
import { ConversationRequest, ConversationModelMapper, conversationThreadSchema, ConversationPublic, ConversationOverviewStatus } from '@messanger/types';
import { ConversationStatusService } from './conversation-status-service';

export class ConversationService {
  private static conversationRepository = prismaClient.conversation;
  private static conversationStatusRepository = prismaClient.conversationStatus;
  private static conversationEncryptionRepository = prismaClient.encryptionMetadata;
  private static threadParticipantRepository = prismaClient.threadParticipant;

  // static async createConversationInThread(req: ConversationRequest, userId: string): Promise<{ thread: ThreadPublic, conversation: ConversationPublic }> {
  static async createConversationInThread(req: ConversationRequest, threadId: string, userId: string): Promise<ConversationPublic> {
    const validated = conversationThreadSchema.parse({
      threadId,
      content: req.content,
      senderId: req.senderId || userId,
      encryptionMetadata: req.encryptionMetadata,
    });

    const encryptionMetadata = await this.conversationEncryptionRepository.create({
      data: validated.encryptionMetadata || { mac: '', version: '', iv: '' },
    });

    const conversation = await this.conversationRepository.create({
      data: {
        threadId: validated.threadId,
        senderId: validated.senderId,
        content: validated.content,
        encryptionMetadataId: encryptionMetadata.id,
      },
      include: {
        sender: { include: { profile: true } },
      },
    });

    if (!conversation) throw new Error('Conversation not created');



    ConversationStatusService.createConversationStatusForEachParticipants(conversation.id, threadId, userId);

    // return {
    //   thread: ThreadModelMapper.fromThreadToThreadPublic({
    //     ...conversation.thread,
    //     creator: {
    //       ...conversation.thread.creator,
    //       profile: conversation.thread.creator.profile === null ? undefined : conversation.thread.creator.profile,
    //     },
    //   }),
    //   conversation: ConversationModelMapper.fromConversationToConversationPublic(conversation),
    // }
    return ConversationModelMapper.fromConversationToConversationPublic({
      ...conversation,
      sender: {
        ...conversation.sender,
        profile: conversation.sender.profile === null ? undefined : conversation.sender.profile,
      },

    }, undefined, encryptionMetadata ?? undefined);
  }

  static async updateConversationInThread(req: ConversationRequest, threadId: string, conversationId: string, userId: string): Promise<ConversationPublic> {
    const validatedData = conversationThreadSchema.parse({
      threadId: threadId,
      content: req.content,
      senderId: req.senderId || userId,
    });

    const conversation = await this.conversationRepository.update({
      where: { id: conversationId },
      data: {
        content: validatedData.content,
        senderId: validatedData.senderId,
      },
      include: {
        // thread: {
        //   include: {
        //     creator: {
        //       include: { profile: true },
        //     },
        //   },
        // },
        sender: { include: { profile: true } },
      },
    });

    ConversationStatusService.updateConversationStatusByUserId(
      {
        isEdited: true,
      },
      conversation.id,
      userId
    );

    return ConversationModelMapper.fromConversationToConversationPublic({
      ...conversation,
      sender: {
        ...conversation.sender,
        profile: conversation.sender.profile === null ? undefined : conversation.sender.profile,
      },
    });
  }

  static async deleteConversationInThread(conversationId: string, userId: string): Promise<ConversationPublic> {
    const conversation = await this.conversationRepository.findUnique({
      where: { id: conversationId },
      include: {
        thread: { include: { creator: { include: { profile: true } } } },
        sender: { include: { profile: true } },
        conversationStatus: true,
        encryptionMetadata: true,
      },
    });

    if (!conversation) throw new Error('Conversation not found');

    if (conversation.senderId === userId) {
      const updated = await this.conversationRepository.update({
        where: { id: conversationId },
        data: { isDeletedBySender: true, deletedAtBySender: new Date() },
        include: {
          thread: { include: { creator: { include: { profile: true } } } },
          sender: { include: { profile: true } },
        },
      });
      ConversationStatusService.updateConversationStatusByUserId(
        {
          isDeleted: true,
        },
        conversation.id,
        userId
      );
      return ConversationModelMapper.fromConversationToConversationPublic({
        ...updated,
        sender: {
          ...updated.sender,
          profile: updated.sender.profile === null ? undefined : updated.sender.profile,
        },
      }, conversation.conversationStatus, conversation.encryptionMetadata ?? undefined);
    }

    ConversationStatusService.updateConversationStatusByUserId(
      {
        isDeleted: true,
      },
      conversation.id,
      userId
    );

    return ConversationModelMapper.fromConversationToConversationPublic({
      ...conversation,
      sender: {
        ...conversation.sender,
        profile: conversation.sender.profile === null ? undefined : conversation.sender.profile,
      },
    });
  }

  static async deleteManyConversationsInThread(conversationIds: string[], userId: string): Promise<void> {
    const conversations = await this.conversationRepository.findMany({
      where: { id: { in: conversationIds } },
      include: {
        thread: { include: { creator: { include: { profile: true } } } },
        sender: { include: { profile: true } },
      },
    });

    if (conversations.length === 0) throw new Error('No conversations found');
    conversations.map((conversation) => {
      if (conversation.senderId === userId) {
        return this.conversationRepository.update({
          where: { id: conversation.id },
          data: { isDeletedBySender: true, deletedAtBySender: new Date() },
          include: {
            thread: { include: { creator: { include: { profile: true } } } },
            sender: { include: { profile: true } },
          },
        });
      }
      ConversationStatusService.updateConversationStatusByUserId(
        {
          isDeleted: true,
        },
        conversation.id,
        userId
      );
      // return ConversationModelMapper.fromConversationToConversationPublic({
      //   ...conversation,
      //   sender: {
      //     ...conversation.sender,
      //     profile: conversation.sender.profile === null ? undefined : conversation.sender.profile,
      //   },
      // });
    });
  }

  static async getConversationById(conversationId: string, threadId: string, userId: string): Promise<ConversationOverviewStatus> {
    const conversation = await this.conversationRepository.findUnique({
      where: { id: conversationId },
      include: {
        // thread: { include: { creator: { include: { profile: true } } } },
        sender: { include: { profile: true } },
        conversationStatus: true,
      },
    });

    const counts = await this.conversationStatusRepository.aggregate({
      where: { conversationId },
      _count: {
        isRead: true,
        isEdited: true,
        isDeleted: true,
      },
    });

    if (!conversation) throw new Error('Conversation not found');

    // if (conversation.senderId !== userId) {
    //   ConversationStatusService.updateConversationStatusByUserId(
    //     {
    //       isRead: true,
    //     },
    //     conversation.id,
    //     userId
    //   );
    // }

    const conversationIds = await this.conversationRepository.findMany({
      where: { threadId: threadId },
      select: { id: true },
    });
    const ids = conversationIds.map((c) => c.id);

    // Get all participant user IDs in the thread
    const participantIds = await this.threadParticipantRepository.findMany({
      where: { threadId: threadId, isDeleted: false },
      select: { userId: true },
    });
    const userIds = participantIds.map((p) => p.userId);

    // Count ConversationStatus for those conversations and users
    const [countRead, countEdited, countDeleted] = await Promise.all([
      this.conversationStatusRepository.count({
        where: {
          conversationId: { in: ids },
          userId: { in: userIds },
          isRead: true,
        },
      }),
      this.conversationStatusRepository.count({
        where: {
          conversationId: { in: ids },
          userId: { in: userIds },
          isEdited: true,
        },
      }),
      this.conversationStatusRepository.count({
        where: {
          conversationId: { in: ids },
          userId: { in: userIds },
          isDeleted: true,
        },
      }),
    ]);

    return {
      conversation: ConversationModelMapper.fromConversationToConversationPublic({
        ...conversation,
        sender: {
          ...conversation.sender,
          profile: conversation.sender.profile === null ? undefined : conversation.sender.profile,
        },
      }),
      status: {
        countRead,
        countEdited,
        countDeleted,
      },
    };
  }
}
/* 
        static async getConversations(userId: string, queryParams: ConversationQueryParams): Promise<PaginatedData<ConversationPublic>> {
        const { sortBy = "createdAt", sortOrder = "desc", page = 1, pageSize = 10, search, ...rest } = queryParams;
        const skip = (page - 1) * pageSize;
        const take = pageSize;
 
        const where: any = {
            AND: [
                {
                    OR: [
                        { senderId: userId },
                        { receiverId: userId }
                    ]
                },
                { NOT: [{ senderId: userId, receiverId: userId }] }
            ]
        };
 
        if (search) {
            where.AND.push({
                content: { contains: search, mode: "insensitive" }
            });
        }
        Object.assign(where, rest);
 
        const orderBy: any = {};
        orderBy[sortBy] = sortOrder;
 
        const [messages, totalItems] = await Promise.all([
            prismaClient.conversation.findMany({
                where,
                orderBy,
                skip,
                take,
                include: {
                    sender: { include: { profile: { include: { user: true } } } },
                    receiver: { include: { profile: { include: { user: true } } } }
                }
            }),
            prismaClient.conversation.count({ where })
        ]);
 
 
        const latestMessages = new Map<string, typeof messages[0]>();
        for (const message of messages) {
            const participantId = message.senderId === userId ? message.receiverId : message.senderId;
            if (!latestMessages.has(participantId)) {
                latestMessages.set(participantId, message);
            }
        }
 
        return {
 
            items: messages.map(message =>
                ConversationPublic.fromConversationToConversationPublic({
                    ...message,
                    sender: message.sender?.profile!,
                    receiver: message.receiver?.profile!
                })
            ),
            meta: {
                totalItems,
                totalPages: Math.ceil(totalItems / pageSize),
                page,
                pageSize,
                hasNextPage: page < Math.ceil(totalItems / pageSize),
                hasPreviousPage: page > 1
            }
        };
    }
 
    static async getConversationBetweenUsers(authenticatedUser: string, interlocutorUser: string): Promise<ConversationPublic[]> {
        const messages = await this.conversationRepository.findMany({
            where: {
                OR: [
                    { senderId: authenticatedUser, receiverId: interlocutorUser },
                    { senderId: interlocutorUser, receiverId: authenticatedUser }
                ],
                isDeletedBySender: false,
                isDeletedByReceiver: false
            },
            orderBy: { createdAt: "desc" },
            include: {
                sender: { include: { profile: { include: { user: true } } } },
                receiver: { include: { profile: { include: { user: true } } } }
            }
        });
 
        if (messages.length === 0) {
            throw new Error("No conversation found between these users.");
        }
 
        return messages
            .filter(msg => msg.sender?.profile && msg.receiver?.profile)
            .map(msg =>
                ConversationPublic.fromConversationToConversationPublic({
                    ...msg,
                    sender: msg.sender.profile!,
                    receiver: msg.receiver.profile!
                })
            );
    }
    */
