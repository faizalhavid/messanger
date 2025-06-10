import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { ConversationTest, ProfileTest, usersTest, UserTest } from "./test-utils";
import { WsEventName } from "src/websocket/websocket";



describe('GET Conversation', () => {
    beforeEach(async () => {
        await UserTest.create(usersTest[0]);
        await ProfileTest.create({
            userId: usersTest[0].id,
            profile: {
                firstName: 'Test',
                lastName: 'User',
                avatar: 'https://example.com/avatar.jpg'
            }
        });
        await UserTest.create(usersTest[1]);
        await ProfileTest.create({
            userId: usersTest[1].id,
            profile: {
                firstName: 'Receiver',
                lastName: 'User',
                avatar: 'https://example.com/avatar.jpg'
            }
        });
        await ConversationTest.create({
            id: '1',
            content: 'Hello, this is a test message!',
            senderId: usersTest[0].id,
            receiverId: usersTest[1].id
        });

        await ConversationTest.create({
            id: '2',
            content: 'Hello, this is another test message!',
            senderId: usersTest[1].id,
            receiverId: usersTest[0].id
        });
        await ConversationTest.create({
            id: '3',
            content: 'Hello, this is a test message!',
            senderId: usersTest[0].id,
            receiverId: usersTest[1].id
        });

    })
    it('should show all user conversations', async () => {
        const response = await fetch('http://localhost:3000/api/conversations', {
            method: 'GET',
            headers: { 'Authorization': usersTest[0].token }
        });
        console.log('Get conversations response status:', response);
        const body = await response.json();
        console.log('Get conversations response:', body);

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data).toBeDefined();
        //expect(Array.isArray(body.data)).toBe(true);
    });

    it('should show a specific conversation by ID', async () => {
        const response = await fetch(`http://localhost:3000/api/conversations/${usersTest[1].id}`, {
            method: 'GET',
            headers: { 'Authorization': usersTest[0].token }
        });
        console.log('Get conversation by ID response status:', response);
        const body = await response.json();
        console.log('Get conversation by ID response:', body);

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data).toBeDefined();
    });
    afterEach(async () => {
        await UserTest.delete(usersTest[0].username);
        await UserTest.delete(usersTest[1].username);
        await ConversationTest.deleteAll();
    });
});

describe('POST Conversation', () => {
    beforeEach(async () => {
        await UserTest.create(usersTest[0]);
        await UserTest.create(usersTest[1]);

        await ConversationTest.deleteAllByUser(usersTest[0].id);
        await ConversationTest.deleteAllByUser(usersTest[1].id);
    })
    it('should create a new conversation', async () => {
        const response = await fetch('http://localhost:3000/api/conversations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': usersTest[0].token
            },
            body: JSON.stringify({
                content: 'Hello, this is a test message!',
                receiverId: usersTest[1].id
            })
        });
        console.log('Post conversation response status:', response);
        const body = await response.json();
        console.log('Post conversation response:', body);

        expect(response.status).toBe(200);
        //expect(body.success).toBe(true);
        expect(body.data).toBeDefined();
        //expect(body.data.content).toBe('Hello, this is a test message!');
    });

    afterEach(async () => {
        await UserTest.delete(usersTest[0].username);
        await UserTest.delete(usersTest[1].username);

        await ConversationTest.deleteAllByUser(usersTest[0].id);
        await ConversationTest.deleteAllByUser(usersTest[1].id);
    });
});

describe('DELETE Conversation', () => {
    beforeEach(async () => {
        await UserTest.create(usersTest[0]);
        await UserTest.create(usersTest[1]);
        await ConversationTest.create({
            id: '1',
            content: 'Hello, this is a test message!',
            senderId: usersTest[0].id,
            receiverId: usersTest[1].id
        });
    });

    it('receiver should get conversationDeleted event and update state', async () => {
        // 1. Receiver buka ws, get all conversations, simpan conversationId
        const wsReceiver = new WebSocket('ws://localhost:3000/ws?topic=conversations');
        const authReceiver = { event: WsEventName.Authentication, data: { token: usersTest[1].token } };

        await new Promise<void>((resolve, reject) => {
            let timeout = setTimeout(() => {
                wsReceiver.close();
                reject(new Error('Timeout: receiver did not get conversationDeleted event'));
            }, 3000);

            let conversationId: string | undefined;
            let deletedConversationId: string | undefined;

            wsReceiver.onopen = () => {
                wsReceiver.send(JSON.stringify(authReceiver));
            };
            wsReceiver.onmessage = async (event) => {
                const data = JSON.parse(event.data);
                if (data.event === 'auth-success') {
                    // Receiver fetch all conversations
                    const getResponse = await fetch('http://localhost:3000/api/conversations', {
                        method: 'GET',
                        headers: { 'Authorization': usersTest[1].token }
                    });
                    const getBody = await getResponse.json();
                    expect(getResponse.status).toBe(200);
                    expect(getBody.data).toBeDefined();
                    console.log('Receiver conversations:', getBody.data);
                    conversationId = getBody.data.items[0].id;
                    expect(conversationId).toBeDefined();

                    // 2. Setelah receiver siap, sender buka ws dan hapus percakapan
                    const wsSender = new WebSocket(`ws://localhost:3000/ws?topic=conversations:${conversationId}`);
                    const authSender = { event: 'authentication', data: { token: usersTest[0].token } };
                    wsSender.onopen = () => {
                        wsSender.send(JSON.stringify(authSender));
                    };
                    wsSender.onmessage = async (event) => {
                        const senderData = JSON.parse(event.data);
                        if (senderData.event === 'auth-success' && conversationId) {
                            const delResponse = await fetch(`http://localhost:3000/api/conversations/${conversationId}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': usersTest[0].token }
                            });
                            expect(delResponse.status).toBe(200);
                            wsSender.close();
                        }
                    };
                } else if (data.event === 'conversation-deleted') {
                    console.log('Receiver got conversationDeleted event:', data);
                    deletedConversationId = data.data.conversationId;
                    console.log('Receiver got conversationDeleted for:', deletedConversationId);
                    expect(deletedConversationId).toBeDefined();
                    // Receiver bisa update state lokal di sini
                    clearTimeout(timeout);
                    wsReceiver.close();
                    resolve();
                }
            };
            wsReceiver.onerror = (err) => {
                clearTimeout(timeout);
                wsReceiver.close();
                reject(err);
            };
        });
    });


    afterEach(async () => {
        await UserTest.delete(usersTest[0].username);
        await UserTest.delete(usersTest[1].username);
    });
});