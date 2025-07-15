import { prismaClient } from '@messanger/prisma';
import { randomUUID } from 'crypto';
import { WsEventName, WsBroadcastEvent } from '@messanger/types';
import { generateKeyPairSync } from 'crypto';

interface UserTestProps {
  id: string;
  username: string;
  email: string;
  token: string;
  password: string;
  profile?: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

const userProfiles: UserTestProps['profile'][] = [
  { firstName: 'Test', lastName: 'User', avatar: 'https://example.com/avatar.jpg' },
  { firstName: 'Test2', lastName: 'User2', avatar: 'https://example.com/avatar2.jpg' },
  { firstName: 'Test3', lastName: 'User3', avatar: 'https://example.com/avatar3.jpg' },
];

export const usersTest: UserTestProps[] = [
  { id: 'id-test1', username: 'testuser', email: 'test@mail.com', token: 'token-test1', password: 'pAssword123@', profile: userProfiles[0] },
  { id: 'id-test2', username: 'testuser2', email: 'test2@mail.com', token: 'token-test2', password: 'pAssword123@', profile: userProfiles[1] },
  { id: 'id-test3', username: 'testuser3', email: 'test3@mail.com', token: 'token-test3', password: 'pAssword123@', profile: userProfiles[2] },
];

export function generateWSData(event: WsEventName, data: {}): WsBroadcastEvent {
  return {
    event: event,
    data: data,
    timestamp: Date.now(),
    requestId: randomUUID(),
  };
}

export class UserTest {
  static async create(props: UserTestProps) {
    let { id, username, email, token } = props;
    if (!id) {
      id = crypto.randomUUID();
    }
    await prismaClient.user.create({
      data: {
        id: id,
        username: username,
        email: email,
        password: await Bun.password.hash('pAssword123@', {
          algorithm: 'bcrypt',
          cost: 10,
        }),
        token: token,
      },
    });
  }

  static async delete(username: string) {
    await prismaClient.user.deleteMany({
      where: {
        username: username,
      },
    });
  }
  static async deleteAll() {
    await prismaClient.user.deleteMany({});
  }
}

export class ProfileTest {
  static async create(props: {
    userId: string;
    profile: {
      firstName: string;
      lastName: string;
      avatar?: string;
      description?: string;
    };
  }) {
    const { userId, profile } = props;
    if (!profile) {
      throw new Error('Profile data is required to create a profile');
    }
    const { firstName, lastName } = profile;
    await prismaClient.profile.create({
      data: {
        firstName: firstName,
        lastName: lastName,
        description: profile.description ?? 'default',
        avatar: 'https://example.com/avatar.jpg',
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  static async delete(username: string) {
    await prismaClient.profile.deleteMany({
      where: {
        user: {
          username: username,
        },
      },
    });
  }
  static async deleteAll() {
    await prismaClient.profile.deleteMany({});
  }
}

export class ConversationTest {
  static async create(props: { id: string; content: string; senderId: string; threadId: string }) {
    const { id, content, senderId, threadId } = props;
    await prismaClient.conversation.create({
      data: {
        id: id,
        content: content,
        senderId: senderId,
        threadId: threadId,
      },
    });
  }
  static async deleteAllByUser(userId: string) {
    await prismaClient.conversation.deleteMany({
      where: {
        OR: [{ senderId: userId }],
      },
    });
  }

  static async deleteAll() {
    await prismaClient.conversation.deleteMany({});
  }
}

export class ConversationStatusTest {
  static async create(props: { id: string; userId: string; conversationId: string; isDeleted?: boolean }) {
    const { id, userId, conversationId, isDeleted } = props;
    await prismaClient.conversationStatus.create({
      data: {
        id: id,
        userId: userId,
        conversationId: conversationId,
        isDeleted: isDeleted || false,
      },
    });
  }

  static async deleteAllByUser(userId: string) {
    await prismaClient.conversationStatus.deleteMany({
      where: {
        userId: userId,
      },
    });
  }

  static async deleteAll() {
    await prismaClient.conversationStatus.deleteMany({});
  }
}

export class ThreadTest {
  static async create(props: { id: string; type: 'PRIVATE' | 'GROUP'; creatorId: string; participantIds?: string[]; name?: string }) {
    const { id, type, creatorId, participantIds, name = 'Default Thread Name' } = props;

    const data = await prismaClient.thread.create({
      data: {
        id: id,
        type: type,
        creatorId: creatorId,
        name: name,
        participants: {
          create: participantIds?.map((userId) => ({ userId })) || [],
        },
      },
    });
    return data;
  }

  static async deleteAll() {
    await prismaClient.thread.deleteMany();
  }
}

export class ThreadParticipantsTest {
  static async create(props: { id: string; threadId: string; userId: string }) {
    const { id, threadId, userId } = props;
    await prismaClient.threadParticipant.create({
      data: {
        id: id,
        threadId: threadId,
        userId: userId,
      },
    });
  }

  static async deleteAllByThread(threadId: string) {
    await prismaClient.threadParticipant.deleteMany({
      where: {
        threadId: threadId,
      },
    });
  }

  static async deleteAll() {
    await prismaClient.threadParticipant.deleteMany({});
  }
}
export class FriendshipTest {
  static async create(props: { id: string; userId: string; friendId: string; status?: 'PENDING' | 'ACCEPTED' | 'DECLINED' }) {
    const { id, userId, friendId, status } = props;
    await prismaClient.friendship.create({
      data: {
        id: id,
        userId: userId,
        friendId: friendId,
        initiatorId: userId, // Assuming the userId is the initiator
        status: status || 'PENDING',
      },
    });
  }

  static async deleteAllByUser(userId: string) {
    await prismaClient.friendship.deleteMany({
      where: {
        OR: [{ userId: userId }, { friendId: userId }],
      },
    });
  }

  static async deleteAll() {
    await prismaClient.friendship.deleteMany({});
  }
}

const subtle = crypto.subtle;

export async function generateAppKeyPair() {
  const keyPair = await subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256"
    },
    true,
    ["encrypt", "decrypt"]
  );
  return keyPair;
}

export async function generateMessage(publicKey: CryptoKey, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const encodedMessage = encoder.encode(message);
  const encryptedMessage = await subtle.encrypt(
    {
      name: "RSA-OAEP"
    },
    publicKey,
    encodedMessage
  );
  return Buffer.from(encryptedMessage).toString('base64');
}

export async function decryptMessage(privateKey: CryptoKey, encryptedMessage: string): Promise<string> {
  const decoder = new TextDecoder();
  const decryptedBuffer = await subtle.decrypt(
    {
      name: "RSA-OAEP"
    },
    privateKey,
    Buffer.from(encryptedMessage, 'base64')
  );
  return decoder.decode(decryptedBuffer);
}