
import { prismaClient } from "@messanger/prisma";
import { randomUUID } from "crypto";
import { WsEventName, WsBroadcastEvent } from "@messanger/types";

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
    }
}

const userProfiles: UserTestProps['profile'][] = [
    { firstName: 'Test', lastName: 'User', avatar: 'https://example.com/avatar.jpg' },
    { firstName: 'Test2', lastName: 'User2', avatar: 'https://example.com/avatar2.jpg' },
    { firstName: 'Test3', lastName: 'User3', avatar: 'https://example.com/avatar3.jpg' }
]


export const usersTest: UserTestProps[] = [
    { id: 'id-test1', username: 'testuser', email: 'test@mail.com', token: 'token-test1', password: 'pAssword123@', profile: userProfiles[0] },
    { id: 'id-test2', username: 'testuser2', email: 'test2@mail.com', token: 'token-test2', password: 'pAssword123@', profile: userProfiles[1] },
    { id: 'id-test3', username: 'testuser3', email: 'test3@mail.com', token: 'token-test3', password: 'pAssword123@', profile: userProfiles[2] }
]



export function generateWSData(event: WsEventName, data: {},): WsBroadcastEvent {
    return {
        event: event,
        data: data,
        timestamp: Date.now(),
        requestId: randomUUID()
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
                password: await Bun.password.hash("pAssword123@", {
                    algorithm: "bcrypt",
                    cost: 10
                }),
                token: token
            }
        })
    }

    static async delete(username: string) {
        await prismaClient.user.deleteMany({
            where: {
                username: username
            }
        })
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
        }
    }) {
        const { userId, profile } = props;
        if (!profile) {
            throw new Error("Profile data is required to create a profile");
        }
        const { firstName, lastName } = profile;
        await prismaClient.profile.create({
            data: {
                firstName: firstName,
                lastName: lastName,
                avatar: "https://example.com/avatar.jpg",
                user: {
                    connect: { id: userId }
                }
            }
        })
    }

    static async delete(username: string) {
        await prismaClient.profile.deleteMany({
            where: {
                user: {
                    username: username
                }
            }
        })
    }
    static async deleteAll() {
        await prismaClient.profile.deleteMany({});
    }

}

export class ConversationTest {
    static async create(props: {
        id: string;
        content: string;
        senderId: string;
        receiverId: string;
        threadId: string;
    }) {
        const { id, content, senderId, receiverId, threadId } = props;
        await prismaClient.conversation.create({
            data: {
                id: id,
                content: content,
                senderId: senderId,
                receiverId: receiverId,
                conversationThreadId: threadId
            }
        });
    }
    static async deleteAllByUser(userId: string) {
        await prismaClient.conversation.deleteMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            }
        });
    }

    static async deleteAll() {
        await prismaClient.conversation.deleteMany({});
    }
}

export class ConversationThreadTest {
    static async create(props: {
        id: string;
        type: 'PRIVATE' | 'GROUP';
        userAId?: string;
        userBId?: string;
    }) {
        const { id, type, userAId, userBId } = props;

        if (!userAId || !userBId) {
            throw new Error("userAId and userBId are required for creating a conversation thread.");
        }

        const data = await prismaClient.conversationThread.create({
            data: {
                id: id,
                type: type,
                userAId: userAId,
                userBId: userBId,
            }
        });
        return data;
    }

    static async deleteAll() {
        await prismaClient.conversationThread.deleteMany();
    }
}

export class ConversationGroupsTest {
    static async create(props: {
        id: string;
        name: string;
        ownerId: string;
        memberIds: string[];
    }) {
        const { id, name, ownerId, memberIds: members } = props;
        try {
            await prismaClient.conversationGroup.create({
                data: {
                    id: id,
                    name: name,
                    ownerId: ownerId,
                    members: {
                        create: members.map(userId => ({
                            user: { connect: { id: userId } }
                        }))
                    }
                }
            });
        } catch (err) {
            console.error('Failed to create message group:', err);
            throw err;
        }
    }

    static async clearAllGroups() {
        await prismaClient.conversationGroup.deleteMany({});
    }
}

export class ConversationGroupsMessagesTest {
    static async create(props: {
        id: string;
        messageId: string;
        senderId: string;
        groupId: string;
    }) {
        const { id, messageId, senderId, groupId } = props;
        await prismaClient.conversationGroupMessages.create({
            data: {
                id: id,
                conversationId: messageId,
                groupId: groupId
            }
        });
    }

    static async clearAllMessages(groupId: string) {
        await prismaClient.conversationGroupMessages.deleteMany({
            where: {
                groupId: groupId
            }
        });
    }
}