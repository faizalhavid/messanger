import { prismaClient } from '@messanger/prisma';
import { ConversationOverviewStatus, ConversationStatusRequest } from '@messanger/types';

export class ConversationStatusService {
  private static conversationStatusRepository = prismaClient.conversationStatus;
  private static threadRepository = prismaClient.thread;
  private static conversationRepository = prismaClient.conversation;

  static async createConversationStatusForEachParticipants(conversationId: string, threadId: string, userId: string): Promise<void> {
    const thread = await this.threadRepository.findUnique({
      where: { id: threadId },
      include: { messages: true, participants: true },
    });

    // Todo : fix bug after post a message sender status isRead wont be true
    const participantIds = thread?.participants.filter((participant) => !participant.isDeleted).map((participant) => participant.userId) || [];
    await this.conversationStatusRepository.createMany({
      data: participantIds.map((participantId) => ({
        conversationId: conversationId,
        threadId: threadId,
        userId: participantId,
        isDeleted: false,
        isRead: thread?.participants.some((participant) => participant.userId === userId) || false,
        isEdited: false,
      })),
      skipDuplicates: true,
    });
  }

  static async updateConversationStatusByUserId(req: ConversationStatusRequest, conversationStatusId: string, userId: string): Promise<void> {
    await this.conversationStatusRepository.update({
      where: {
        id: conversationStatusId,
        userId: userId,
      },
      data: {
        isDeleted: req.isDeleted || false,
        deletedAt: req.isDeleted ? new Date() : null,
        isEdited: req.isEdited || false,
        editedAt: req.isEdited ? new Date() : null,
      },
    });
  }

  //   static async updateReadStatusMany(conversationIds: string[], userId: string): Promise<void> {
  //     await this.conversationStatusRepository.updateMany({
  //       where: {
  //         conversationId: { in: conversationIds },
  //         userId: userId,
  //       },
  //       data: {
  //         isRead: true,
  //         readAt: new Date(),
  //       },
  //     });
  //   }

  static async updateReadStatusForAllConversationInThread(threadId: string, userId: string): Promise<void> {
    // Fetch the thread with its conversations
    const thread = await this.threadRepository.findUnique({
      where: { id: threadId },
      include: { messages: true },
    });

    if (!thread || !thread.messages || thread.messages.length === 0) {
      return;
    }

    const conversationIds = thread.messages.map((conv: { id: string }) => conv.id);

    await this.conversationStatusRepository.updateMany({
      where: {
        conversationId: { in: conversationIds },
        userId: userId,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  static async getConversationStatusByConversationId(conversationId: string, userId: string): Promise<ConversationOverviewStatus | null> {
    const status = await this.conversationStatusRepository.findUnique({
      where: {
        conversationId_userId: {
          conversationId: conversationId,
          userId: userId,
        },
      },
      include: {
        conversation: true,
      },
    });

    if (!status) return null;

    // Count how many participants in this conversation have each status
    const counts = await this.conversationStatusRepository.aggregate({
      where: { conversationId },
      _count: {
        isRead: true,
        isEdited: true,
        isDeleted: true,
      },
    });

    return {
      conversation: status.conversation,
      status: {
        countRead: counts._count.isRead || 0,
        countEdited: counts._count.isEdited || 0,
        countDeleted: counts._count.isDeleted || 0,
      },
    };
  }
}
