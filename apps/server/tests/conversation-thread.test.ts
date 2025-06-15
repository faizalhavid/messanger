import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { UserTest, usersTest, ProfileTest, ConversationThreadTest, ConversationTest } from "./test-utils";

describe('ConversationThread API', () => {
    beforeEach(async () => {
        await UserTest.create(usersTest[0]);
        await UserTest.create(usersTest[1]);
        await ProfileTest.create({
            userId: usersTest[0].id,
            profile: {
                firstName: 'Test',
                lastName: 'User',
                avatar: 'https://example.com/avatar.jpg'
            }
        });
        await ProfileTest.create({
            userId: usersTest[1].id,
            profile: {
                firstName: 'Receiver',
                lastName: 'User',
                avatar: 'https://example.com/avatar.jpg'
            }
        });
    });

    it('should create a new private conversation thread', async () => {
        const response = await fetch('http://localhost:3000/api/conversation-threads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': usersTest[0].token
            },
            body: JSON.stringify({
                type: 'PRIVATE',
                userAId: usersTest[0].id,
                userBId: usersTest[1].id
            })
        });
        console.log("Response :", response)
        const body = await response.json();
        console.log("Response Body", body);
        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data).toBeDefined();
        expect(body.data.type).toBe('PRIVATE');
        expect(body.data.interlocutor).toBeDefined();
        expect(body.data.interlocutor.id).toBe(usersTest[1].id);
        expect(body.data.interlocutor.username).toBe(usersTest[1].username);
        // Simuation create new message in thread
        const responseMessage = await fetch('http://localhost:3000/api/conversations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': usersTest[0].token
            },
            body: JSON.stringify({
                threadId: body.data.id,
                receiverId: usersTest[1].id,
                content: 'Hello!'
            })
        });
        const messageBody = await responseMessage.json();
        console.log("Message Body", messageBody);
        expect(responseMessage.status).toBe(200);
        expect(messageBody.success).toBe(true);
        expect(messageBody.data).toBeDefined();
        expect(messageBody.data.content).toBe('Hello!');
        expect(messageBody.data.receiver.id).toBe(usersTest[1].id);

        //  Simulation get last message in thread list
        const getResponse = await fetch('http://localhost:3000/api/conversation-threads',
            {
                method: 'GET',
                headers: { 'Authorization': usersTest[0].token }
            });
        const getBody = await getResponse.json();
        console.log("Get Response Body", getBody);
        expect(getResponse.status).toBe(200);
        expect(getBody.success).toBe(true);
        expect(getBody.data).toBeDefined();
        expect(Array.isArray(getBody.data.items)).toBe(true);
    });

    it('should get all conversation threads for a user', async () => {
        // Buat thread dulu
        await ConversationThreadTest.create({
            id: 'thread-1',
            type: 'PRIVATE',
            userAId: usersTest[0].id,
            userBId: usersTest[1].id
        });

        await ConversationTest.create({
            id: 'conversation-1',
            threadId: 'thread-1',
            senderId: usersTest[0].id,
            receiverId: usersTest[1].id,
            content: 'Hello!',
        });

        const response = await fetch('http://localhost:3000/api/conversation-threads', {
            method: 'GET',
            headers: { 'Authorization': usersTest[0].token }
        });
        console.log("Response", response);
        const body = await response.json();
        console.log("Body", body);
        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data).toBeDefined();
        expect(Array.isArray(body.data.items)).toBe(true);
        expect(body.data.items.length).toBeGreaterThan(0);
    });

    it('should get a conversation thread by ID', async () => {
        const thread = await ConversationThreadTest.create({
            id: 'thread-1',
            type: 'PRIVATE',
            userAId: usersTest[0].id,
            userBId: usersTest[1].id
        });

        const response = await fetch(`http://localhost:3000/api/conversation-threads/${thread.id}`, {
            method: 'GET',
            headers: { 'Authorization': usersTest[0].token }
        });
        console.log("Response :", response);
        const body = await response.json();
        console.log("Body :", body)
        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data).toBeDefined();
        expect(body.data.thread.id).toBe(thread.id);
    });

    it('should delete a conversation thread', async () => {
        const thread = await ConversationThreadTest.create({
            id: 'thread-1',
            type: 'PRIVATE',
            userAId: usersTest[0].id,
            userBId: usersTest[1].id
        });

        const response = await fetch(`http://localhost:3000/api/conversation-threads/${thread.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': usersTest[0].token }
        });
        const body = await response.json();
        console.log("Response :", response);
        expect(response.status).toBe(200);
        expect(body.success).toBe(true);

        // Pastikan thread sudah tidak ada
        const getResponse = await fetch(`http://localhost:3000/api/conversation-threads/${thread.id}`, {
            method: 'GET',
            headers: { 'Authorization': usersTest[0].token }
        });
        const getBody = await getResponse.json();
        console.log("Body :", getBody);
        // expect(getResponse.status).toBe(404);
    });

    afterEach(async () => {
        await ConversationThreadTest.deleteAll();
        await UserTest.delete(usersTest[0].username);
        await UserTest.delete(usersTest[1].username);
    });
});