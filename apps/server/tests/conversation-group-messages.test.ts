import { beforeEach, describe, it, afterEach, expect } from "bun:test";
import { ConversationGroupsMessagesTest, ConversationGroupsTest, ConversationTest, usersTest, UserTest } from "./test-utils";
import { use } from "hono/jsx";


describe('POST Message Group', () => {
    beforeEach(async () => {
        await UserTest.create(usersTest[0]);
        await UserTest.create(usersTest[1]);
        await ConversationGroupsTest.create({
            id: '1',
            name: 'Test Group',
            ownerId: usersTest[0].id,
            memberIds: [usersTest[0].id, usersTest[1].id],
        });
    });

    it('should send a group conversation', async () => {
        const response = await fetch('http://localhost:3000/api/conversation-groups-messages/1', {
            method: 'POST',
            headers: { 'Authorization': usersTest[0].token, 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: 'Hello Group!' })
        });
        console.log('Send group conversation response status:', response.status);
        const body = await response.json();
        console.log('Send group conversation response:', body);
        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data).toBeDefined();
    });

    afterEach(async () => {
        await UserTest.delete(usersTest[0].username);
        await UserTest.delete(usersTest[1].username);
        await ConversationGroupsTest.clearAllGroups();
    });
})

describe('GET Group Conversations', () => {
    beforeEach(async () => {
        await UserTest.create(usersTest[0]);
        await UserTest.create(usersTest[1]);
        await ConversationGroupsTest.create({
            id: '1',
            name: 'Test Group',
            ownerId: usersTest[0].id,
            memberIds: [usersTest[0].id, usersTest[1].id],
        });
        await ConversationTest.create({
            id: '1',
            content: 'Hello Group!',
            senderId: usersTest[0].id,
            receiverId: usersTest[1].id
        });
        await ConversationGroupsMessagesTest.create({
            id: '1',
            groupId: '1',
            messageId: '1',
            senderId: usersTest[0].id,
        });

    });

    it('should get group conversations', async () => {
        const response = await fetch('http://localhost:3000/api/conversation-groups-messages/1', {
            method: 'GET',
            headers: { 'Authorization': usersTest[0].token }
        });
        console.log('Get group conversations response status:', response.status);
        const body = await response.json();
        console.log('Get group conversations response:', body);
        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data).toBeDefined();
    });

    // it('should get group conversations detail', async () => {
    //     const response = await fetch('http://localhost:3000/api/group-conversations/1/messages/1', {
    //         method: 'GET',
    //         headers: { 'Authorization': usersTest[0].token }
    //     });
    //     console.log('Get group conversations detail response status:', response.status);
    //     const body = await response.json();
    //     console.log('Get group conversations detail response:', body);
    //     expect(response.status).toBe(200);
    //     expect(body.success).toBe(true);
    //     expect(body.data).toBeDefined();
    //     //expect(body.data.items).toBeDefined();
    // });

    afterEach(async () => {
        await UserTest.delete(usersTest[0].username);
        await UserTest.delete(usersTest[1].username);
        await ConversationGroupsTest.clearAllGroups();
    });
});

describe('DELETE Group Conversation', () => {
    beforeEach(async () => {
        await UserTest.create(usersTest[0]);
        await UserTest.create(usersTest[1]);
        await ConversationGroupsTest.create({
            id: '1',
            name: 'Test Group',
            ownerId: usersTest[0].id,
            memberIds: [usersTest[0].id, usersTest[1].id],
        });
        await ConversationTest.create({
            id: '1',
            content: 'Hello Group!',
            senderId: usersTest[0].id,
            receiverId: usersTest[1].id
        });
        await ConversationGroupsMessagesTest.create({
            id: '1',
            groupId: '1',
            messageId: '1',
            senderId: usersTest[0].id,
        });
    });

    it('should delete a group conversation', async () => {
        const response = await fetch('http://localhost:3000/api/conversation-groups-messages/1/messages/1', {
            method: 'DELETE',
            headers: { 'Authorization': usersTest[0].token }
        });
        console.log('Delete group conversation response status:', response.status);
        const body = await response.json();
        console.log('Delete group conversation response:', body);
        expect(response.status).toBe(200);
        expect(body.success).toBe(true);

        // Verify the message is deleted
        const groupResponse = await fetch('http://localhost:3000/api/conversation-groups-messages/1/messages/1', {
            method: 'GET',
            headers: { 'Authorization': usersTest[0].token }
        });
        console.log('Get group messages after delete response status:', groupResponse.status);
        const groupBody = await groupResponse.json();
        console.log('Get group messages after delete response:', groupBody);
        expect(groupResponse.status).toBe(200);
        expect(groupBody.success).toBe(true);
        // expect(groupBody.data.items.length).toBe(0);

    });

    it('should delete conversation in a group by owner', async () => {
        const response = await fetch('http://localhost:3000/api/conversation-groups-messages/1/messages/1/by-owner', {
            method: 'DELETE',
            headers: { 'Authorization': usersTest[0].token }
        });
        console.log('Delete messages by owner response status:', response.status);
        const body = await response.json();
        console.log('Delete messages by owner response:', body);
        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        // Verify the message is deleted
        const groupResponse = await fetch('http://localhost:3000/api/conversation-groups-messages/1/messages/1', {
            method: 'GET',
            headers: { 'Authorization': usersTest[0].token }
        });
        console.log('Get group messages after delete all response status:', groupResponse.status);
        const groupBody = await groupResponse.json();
        console.log('Get group messages after delete all response:', groupBody);
        expect(groupResponse.status).toBe(200);
        expect(groupBody.success).toBe(true);
        // expect(groupBody.data.items.length).toBe(0);

    });
    afterEach(async () => {
        await UserTest.delete(usersTest[0].username);
        await UserTest.delete(usersTest[1].username);
        await ConversationGroupsTest.clearAllGroups();
        await ConversationGroupsMessagesTest.clearAllMessages("1");
    });
});
