import type { Conversation, ConversationStatus } from '@prisma/client';
import type { ConversationPublic } from './conversation';

export interface ConversationStatusRequest {
  // conversationId: string;
  isDeleted?: boolean;
  isRead?: boolean;
  isEdited?: boolean;
}

export interface ConversationStatusPublic extends Omit<ConversationStatus, 'deletedAt' | 'createdAt' | 'editedAt' | 'readAt'> {}

export interface ConversationOverviewStatus {
  conversation: Omit<ConversationPublic, 'status'>;
  status?: {
    countRead?: number;
    countEdited?: number;
    countDeleted?: number;
  };
}

export namespace ConversationStatusModelMapper {
  export function fromConversationStatusToConversationStatusPublic(status: ConversationStatus): ConversationStatusPublic {
    const { deletedAt, editedAt, readAt, ...rest } = status;
    return {
      ...rest,
    };
  }
}
