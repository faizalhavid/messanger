import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { MessageTest, usersTest, UserTest } from "./test-utils";
import { PaginatedResponse } from "@/core/types/api-response";
import { MessagePublic } from "@/message/types/message";
import { WsEventName } from "@/core/types/websocket";


describe('GET Message', () => {
    beforeEach(async () => {
        await UserTest.create(usersTest[0]);
        await UserTest.create(usersTest[1]);
        await MessageTest.create({
            id: '1',
            content: 'Hello, this is a test message!',
            senderId: usersTest[0].id,
            receiverId: usersTest[1].id
        });

    })
    it('should show all user messages', async () => {
        const response = await fetch('http://localhost:3000/messages', {
            method: 'GET',
            headers: { 'Authorization': usersTest[0].token }
        });
        console.log('Get messages response status:', response);
        const body = await response.json();
        console.log('Get messages response:', body);

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data).toBeDefined();
        //expect(Array.isArray(body.data)).toBe(true);
    });

    it('should show a specific message by ID', async () => {
        const response = await fetch('http://localhost:3000/messages/1', {
            method: 'GET',
            headers: { 'Authorization': usersTest[0].token }
        });
        console.log('Get message by ID response status:', response);
        const body = await response.json();
        console.log('Get message by ID response:', body);

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data).toBeDefined();
    });
    afterEach(async () => {
        await UserTest.delete(usersTest[0].username);
        await UserTest.delete(usersTest[1].username);
    });
});

describe('POST Message', () => {
    beforeEach(async () => {
        await UserTest.create(usersTest[0]);
        await UserTest.create(usersTest[1]);

        await MessageTest.clearAllMessages(usersTest[0].id);
        await MessageTest.clearAllMessages(usersTest[1].id);
    })
    it('should create a new message', async () => {
        const response = await fetch('http://localhost:3000/messages', {
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
        console.log('Post message response status:', response);
        const body = await response.json();
        console.log('Post message response:', body);

        expect(response.status).toBe(200);
        //expect(body.success).toBe(true);
        expect(body.data).toBeDefined();
        //expect(body.data.content).toBe('Hello, this is a test message!');
    });

    afterEach(async () => {
        await UserTest.delete(usersTest[0].username);
        await UserTest.delete(usersTest[1].username);

        await MessageTest.clearAllMessages(usersTest[0].id);
        await MessageTest.clearAllMessages(usersTest[1].id);
    });
});

describe('DELETE Message', () => {
    beforeEach(async () => {
        await UserTest.create(usersTest[0]);
        await UserTest.create(usersTest[1]);
        await MessageTest.create({
            id: '1',
            content: 'Hello, this is a test message!',
            senderId: usersTest[0].id,
            receiverId: usersTest[1].id
        });
    });

    it('receiver should get messageDeleted event and update state', async () => {
        // 1. Receiver buka ws, get all messages, simpan messageId
        const wsReceiver = new WebSocket('ws://localhost:3000/ws?topic=messages');
        const authReceiver = { event: WsEventName.Authentication, data: { token: usersTest[1].token } };

        await new Promise<void>((resolve, reject) => {
            let timeout = setTimeout(() => {
                wsReceiver.close();
                reject(new Error('Timeout: receiver did not get messageDeleted event'));
            }, 3000);

            let messageId: string | undefined;
            let deletedMessageId: string | undefined;

            wsReceiver.onopen = () => {
                wsReceiver.send(JSON.stringify(authReceiver));
            };
            wsReceiver.onmessage = async (event) => {
                const data = JSON.parse(event.data);
                if (data.event === 'auth-success') {
                    // Receiver fetch all messages
                    const getResponse = await fetch('http://localhost:3000/messages', {
                        method: 'GET',
                        headers: { 'Authorization': usersTest[1].token }
                    });
                    const getBody = await getResponse.json();
                    expect(getResponse.status).toBe(200);
                    expect(getBody.data).toBeDefined();
                    console.log('Receiver messages:', getBody.data);
                    messageId = getBody.data.items[0].id;
                    expect(messageId).toBeDefined();

                    // 2. Setelah receiver siap, sender buka ws dan hapus pesan
                    const wsSender = new WebSocket('ws://localhost:3000/ws?topic=messages');
                    const authSender = { event: 'authentication', data: { token: usersTest[0].token } };
                    wsSender.onopen = () => {
                        wsSender.send(JSON.stringify(authSender));
                    };
                    wsSender.onmessage = async (event) => {
                        const senderData = JSON.parse(event.data);
                        if (senderData.event === 'auth-success' && messageId) {
                            const delResponse = await fetch(`http://localhost:3000/messages/${messageId}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': usersTest[0].token }
                            });
                            expect(delResponse.status).toBe(200);
                            wsSender.close();
                        }
                    };
                } else if (data.event === 'message-deleted') {
                    console.log('Receiver got messageDeleted event:', data);
                    deletedMessageId = data.data.messageId;
                    console.log('Receiver got messageDeleted for:', deletedMessageId);
                    expect(deletedMessageId).toBeDefined();
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