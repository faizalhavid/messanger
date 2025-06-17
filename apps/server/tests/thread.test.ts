import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { UserTest, usersTest, ProfileTest, ThreadTest, ConversationTest, ConversationStatusTest } from "./test-utils";


describe('Thread API', () => {
    beforeEach(async () => {
        await UserTest.create(usersTest[0]);
        await UserTest.create(usersTest[1]);
        await UserTest.create(usersTest[2]);
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

    it('should create a new private thread', async () => {
        const response = await fetch('http://localhost:3000/api/threads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': usersTest[0].token
            },
            body: JSON.stringify({
                name: 'Test Private Thread',
                type: 'PRIVATE',
                participantIds: [usersTest[1].id]
            })
        });
        console.log('Response:', response);
        const body = await response.json();
        console.log('Response Body:', body);
        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data).toBeDefined();
        expect(body.data.type).toBe('PRIVATE');
        expect(body.data.participants.some((p: any) => p.id === usersTest[1].id)).toBe(true);
    });

    it('should create a new group thread', async () => {
        const response = await fetch('http://localhost:3000/api/threads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': usersTest[0].token
            },
            body: JSON.stringify({
                type: 'GROUP',
                name: 'Test Group',
                participantIds: [usersTest[1].id, usersTest[2].id]
            })
        });
        console.log("Response", response);
        const body = await response.json();
        console.log("Response body :", body);
        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data).toBeDefined();
        expect(body.data.type).toBe('GROUP');
        expect(body.data.name).toBe('Test Group');
        expect(body.data.participants.some((p: any) => p.id === usersTest[1].id)).toBe(true);
    });

    it('should get all threads for a user', async () => {
        await ThreadTest.create({
            id: 'thread-1',
            type: 'PRIVATE',
            creatorId: usersTest[0].id,
            participantIds: [usersTest[1].id]
        });
        await ConversationTest.create({
            id: 'conversation-1',
            content: 'Hello, this is a test conversation',
            senderId: usersTest[0].id,
            threadId: 'thread-1'
        });
        await ConversationStatusTest.create({
            id: 'status-1',
            userId: usersTest[0].id,
            conversationId: 'conversation-1',
            isDeleted: false
        });
        await ThreadTest.create({
            id: 'thread-2',
            type: 'GROUP',
            creatorId: usersTest[0].id,
            participantIds: [usersTest[1].id, usersTest[2].id]
        });
        await ConversationTest.create({
            id: 'conversation-2',
            content: 'This is a group conversation',
            senderId: usersTest[1].id,
            threadId: 'thread-2'
        });
        await ConversationStatusTest.create({
            id: 'status-2',
            userId: usersTest[1].id,
            conversationId: 'conversation-2',
            isDeleted: false
        });
        const response = await fetch('http://localhost:3000/api/threads', {
            method: 'GET',
            headers: { 'Authorization': usersTest[0].token }
        });
        console.log("Response :", response);
        const body = await response.json();
        console.log("Response body :", body)
        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data).toBeDefined();
        expect(Array.isArray(body.data.items)).toBe(true);
        expect(body.data.items.length).toBeGreaterThan(0);
    });

    it('should get a thread by ID', async () => {
        const thread = await ThreadTest.create({
            id: 'thread-2',
            type: 'PRIVATE',
            creatorId: usersTest[0].id,
            participantIds: [usersTest[1].id]
        });
        await ConversationTest.create({
            id: 'conversation-1',
            content: 'This is a test conversation',
            senderId: usersTest[0].id,
            threadId: thread.id
        });
        await ConversationStatusTest.create({
            id: 'status-1',
            userId: usersTest[0].id,
            conversationId: 'conversation-1',
            isDeleted: false
        });
        await ConversationTest.create({
            id: 'conversation-2',
            content: 'This is another conversation',
            senderId: usersTest[1].id,
            threadId: thread.id
        });
        await ConversationStatusTest.create({
            id: 'status-2',
            userId: usersTest[1].id,
            conversationId: 'conversation-2',
            isDeleted: false
        });
        const response = await fetch(`http://localhost:3000/api/threads/${thread.id}`, {
            method: 'GET',
            headers: { 'Authorization': usersTest[0].token }
        });
        console.log("Response :", response);
        const body = await response.json();
        console.log("Response body :", body);
        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data).toBeDefined();
        expect(body.data.thread.id).toBe(thread.id);
    });

    it('should update a thread name', async () => {
        const thread = await ThreadTest.create({
            id: 'thread-3',
            type: 'GROUP',
            creatorId: usersTest[0].id,
            participantIds: [usersTest[1].id]
        });
        const response = await fetch(`http://localhost:3000/api/threads/${thread.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': usersTest[0].token
            },
            body: JSON.stringify({
                name: 'Updated Group Name',
                participantIds: [usersTest[1].id]
            })
        });
        const body = await response.json();
        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data).toBeDefined();
        expect(body.data.name).toBe('Updated Group Name');
    });

    it('should return 400 if creating private thread with wrong participants', async () => {
        const response = await fetch('http://localhost:3000/api/threads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': usersTest[0].token
            },
            body: JSON.stringify({
                type: 'PRIVATE',
                participantIds: []
            })
        });
        expect(response.status).toBe(400);
    });

    it('should return 400 if creating group thread with less than 2 participants', async () => {
        const response = await fetch('http://localhost:3000/api/threads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': usersTest[0].token
            },
            body: JSON.stringify({
                type: 'GROUP',
                participantIds: []
            })
        });
        expect(response.status).toBe(400);
    });

    it('should return 404 for non-existent thread', async () => {
        const response = await fetch('http://localhost:3000/api/threads/non-existent-id', {
            method: 'GET',
            headers: { 'Authorization': usersTest[0].token }
        });
        expect(response.status).toBe(404);
    });

    afterEach(async () => {
        await ThreadTest.deleteAll();
        await UserTest.delete(usersTest[0].username);
        await UserTest.delete(usersTest[1].username);
        await ProfileTest.delete(usersTest[0].username);
        await ProfileTest.delete(usersTest[1].username);
        await ConversationTest.deleteAll();
        await ConversationStatusTest.deleteAll();
    });
});
afterEach(async () => {
    await ThreadTest.deleteAll();
    await ConversationTest.deleteAll();
    await UserTest.deleteAll();
    await ProfileTest.deleteAll();
    await ThreadTest.deleteAll();
    await ConversationTest.deleteAll();
});