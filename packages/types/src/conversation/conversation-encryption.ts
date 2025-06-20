import type { EncryptionMetadata } from '@prisma/client';

export type ConversationEncryptionRequest = {
    mac: string;
    version: string;
    iv: string;
};

export interface ConversationEncryptionPublic extends Omit<EncryptionMetadata, 'encryptionKey'> {

}