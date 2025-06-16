import { send } from 'process';
import { prismaClient } from '@messanger/prisma';
import { ConversationRequest, ConversationModelMapper, conversationThreadSchema, ConversationQueryParams, PaginatedResponse, PaginatedData, ProfilePublic, ThreadConversationList, ThreadModelMapper, ConversationPublic, ThreadPublic } from '@messanger/types';

export class ConversationService {
  private static conversationRepository = prismaClient.conversation;
  private static conversationThreadRepository = prismaClient.thread;
  private static conversationDeleteRepository = prismaClient.conversationDelete;

  // static async createConversationInThread(req: ConversationRequest, userId: string): Promise<{ thread: ThreadPublic, conversation: ConversationPublic }> {
  static async createConversationInThread(req: ConversationRequest, threadId: string, userId: string): Promise<ConversationPublic> {
    const validatedConversation = conversationThreadSchema.parse({
      threadId: threadId,
      content: req.content,
      senderId: req.senderId || userId,
    });
    const conversation = await this.conversationRepository.create({
      data: {
        threadId: validatedConversation.threadId,
        senderId: validatedConversation.senderId,
        content: validatedConversation.content,
      },
      include: {
        thread: {
          include: {
            creator: {
              include: { profile: true }
            },
          }
        },
        sender: { include: { profile: true } },
      }
    });

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
    return ConversationModelMapper.fromConversationToConversationPublic(conversation);
  }

  static async updateConversationInThread(
    req: ConversationRequest,
    threadId: string,
    conversationId: string,
    userId: string
  ): Promise<ConversationPublic> {
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
        isEdited: true,
        updatedAt: new Date(),
      },
      include: {
        thread: {
          include: {
            creator: {
              include: { profile: true }
            },
          }
        },
        sender: { include: { profile: true } },
      }
    });

    return ConversationModelMapper.fromConversationToConversationPublic(conversation);
  }

  static async deleteConversationInThread(conversationId: string, userId: string): Promise<ConversationPublic> {
    const conversation = await this.conversationRepository.findUnique({
      where: { id: conversationId },
      include: {
        thread: { include: { creator: { include: { profile: true } } } },
        sender: { include: { profile: true } },
      }
    });

    if (!conversation) throw new Error('Conversation not found');

    if (conversation.senderId === userId) {
      const updated = await this.conversationRepository.update({
        where: { id: conversationId },
        data: { isDeleted: true, isDeletedBySender: true, deletedAt: new Date() },
        include: {
          thread: { include: { creator: { include: { profile: true } } } },
          sender: { include: { profile: true } },
        }
      });
      return ConversationModelMapper.fromConversationToConversationPublic(updated);
    }

    await this.conversationDeleteRepository.create({
      data: { conversationId, userId, deletedAt: new Date() }
    });

    return ConversationModelMapper.fromConversationToConversationPublic(conversation);
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
}
