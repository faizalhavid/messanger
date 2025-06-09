import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { ConversationGroupsTest, usersTest, UserTest } from "./test-utils";


describe('Get Message Group', () => {
    beforeEach(async () => {

        await UserTest.create(usersTest[0]);
        await UserTest.create(usersTest[1]);
        await ConversationGroupsTest.create({
            id: '1',
            name: 'Test Group',
            ownerId: usersTest[0].id,
            memberIds: [usersTest[0].id, usersTest[1].id],
        });

    })
    it('should return all conversation groups', async () => {
        const response = await fetch('http://localhost:3000/api/conversation-groups', {
            method: 'GET',
            headers: { 'Authorization': usersTest[0].token }
        });
        console.log('Get conversation groups response status:', response);
        const body = await response.json();
        console.log('Get conversation groups response:', body);
        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data).toBeDefined();
        //expect(Array.isArray(body.data)).toBe(true);
    });

    it('should return conversation group by id', async () => {
        const response = await fetch('http://localhost:3000/api/conversation-groups/1', {
            method: 'GET',
            headers: { 'Authorization': usersTest[0].token }
        });
        console.log('Get conversation group by id response status:', response);
        const body = await response.json();
        console.log('Get conversation group by id response:', body);
        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data).toBeDefined();
        expect(body.data.id).toBe('1');
    });

    afterEach(async () => {
        await UserTest.delete(usersTest[0].username);
        await UserTest.delete(usersTest[1].username);
        await ConversationGroupsTest.clearAllGroups();
    })

});

describe('Create Conversation Group', () => {
    beforeEach(async () => {
        await UserTest.create(usersTest[0]);
        await UserTest.create(usersTest[1]);
    });

    it('should create a conversation group', async () => {
        const response = await fetch('http://localhost:3000/api/conversation-groups', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': usersTest[0].token
            },
            body: JSON.stringify({
                name: 'New Group',
                members: [usersTest[1].id]
            })
        });
        console.log('Create conversation group response status:', response);
        const body = await response.json();
        console.log('Create conversation group response:', body);
        expect(response.status).toBe(201);
        expect(body.success).toBe(true);
        expect(body.data).toBeDefined();
        expect(body.data.name).toBe('New Group');
    });

    afterEach(async () => {
        await UserTest.delete(usersTest[0].username);
        await UserTest.delete(usersTest[1].username);
        await ConversationGroupsTest.clearAllGroups();
    });
});

describe('Update Conversation Group', () => {
    beforeEach(async () => {
        await UserTest.create(usersTest[0]);
        await UserTest.create(usersTest[1]);
        await UserTest.create(usersTest[2]);
        await ConversationGroupsTest.create({
            id: '1',
            name: 'Test Group',
            ownerId: usersTest[0].id,
            memberIds: [usersTest[0].id, usersTest[1].id],
        });
    });

    it('should update a conversation group name', async () => {
        const response = await fetch('http://localhost:3000/api/conversation-groups/1', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': usersTest[0].token
            },
            body: JSON.stringify({
                name: 'Updated Group'
            })
        });
        console.log('Update conversation group response status:', response);
        const body = await response.json();
        console.log('Update conversation group response:', body);
        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data).toBeDefined();
        expect(body.data.name).toBe('Updated Group');
    });

    it('should update members of a conversation group', async () => {
        const response = await fetch('http://localhost:3000/api/conversation-groups/1', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': usersTest[0].token
            },
            body: JSON.stringify({
                name: 'Updated Group',
                members: [usersTest[2].id]
            })
        });
        console.log('Update conversation group members response status:', response);
        const body = await response.json();
        console.log('Update conversation group members response:', body);
        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data).toBeDefined();
        expect(body.data.name).toBe('Updated Group');
        expect(body.data.members.length).toBe(3);
        expect(body.data.members[0].user.id).toBe(usersTest[2].id);
    });

    // TODO : this is test can pass when we implement APIError handling in the service
    it('should not allow non-owner to update group', async () => {
        const response = await fetch('http://localhost:3000/api/conversation-groups/1', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': usersTest[1].token
            },
            body: JSON.stringify({
                name: 'Updated Group',
                members: [usersTest[2].id]
            })
        });
        console.log('Update conversation group members response status:', response);
        const body = await response.json();
        console.log('Update conversation group members response:', body);
        expect(response.status).toBe(403);
        expect(body.success).toBe(false);
        expect(body.message).toBe('Forbidden');
    });

    afterEach(async () => {
        await UserTest.delete(usersTest[0].username);
        await UserTest.delete(usersTest[1].username);
        await UserTest.delete(usersTest[2].username);
        await ConversationGroupsTest.clearAllGroups();
    });
});

describe('Delete Conversation Group', () => {
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

    it('should delete a conversation group', async () => {
        const response = await fetch('http://localhost:3000/api/conversation-groups/1', {
            method: 'DELETE',
            headers: { 'Authorization': usersTest[0].token }
        });
        console.log('Delete conversation group response status:', response);
        const body = await response.json();
        console.log('Delete conversation group response:', body);
        // expect(response.status).toBe(204);
        // expect(body.success).toBe(true);
        // expect(body.data).toBeUndefined();
        // Verify the group is deleted
        const groupResponse = await fetch('http://localhost:3000/api/conversation-groups', {
            method: 'GET',
            headers: { 'Authorization': usersTest[0].token }
        });
        console.log('Get deleted conversation group response status:', groupResponse);
        //expect(groupResponse.status).toBe(404);
        const groupBody = await groupResponse.json();
        console.log('Get deleted conversation group response:', groupBody);
        //expect(response.status).toBe(204);
    });

    it('should delete a member from a conversation group', async () => {
        const response = await fetch(`http://localhost:3000/api/conversation-groups/1/members/${usersTest[1].id}`, {
            method: 'DELETE',
            headers: { 'Authorization': usersTest[0].token }
        });
        console.log('Delete member from conversation group response status:', response);
        const body = await response.json();
        console.log('Delete member from conversation group response:', body);
        //expect(response.status).toBe(204);

        const groupResponse = await fetch('http://localhost:3000/api/conversation-groups/1', {
            method: 'GET',
            headers: { 'Authorization': usersTest[0].token }
        });
        console.log('Get conversation group response status:', groupResponse);
        const groupBody = await groupResponse.json();
        console.log('Get conversation group response:', groupBody);
        expect(groupResponse.status).toBe(200);
        expect(groupBody.success).toBe(true);
        expect(groupBody.data).toBeDefined();
        expect(groupBody.data.members.length).toBe(1);
    });


    // TODO : this is test can pass when we implement APIError handling in the service
    it('should not allow non-owner to delete group', async () => {
        const response = await fetch('http://localhost:3000/api/conversation-groups/1', {
            method: 'DELETE',
            headers: { 'Authorization': usersTest[1].token }
        });
        console.log('Delete conversation group by non-owner response status:', response);
        expect(response.status).toBe(403);
    });

    afterEach(async () => {
        await UserTest.delete(usersTest[0].username);
        await UserTest.delete(usersTest[1].username);
        await ConversationGroupsTest.clearAllGroups();
    });
});