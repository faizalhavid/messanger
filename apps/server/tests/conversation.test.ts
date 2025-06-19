import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { ConversationStatusTest, ConversationTest, ProfileTest, ThreadTest, usersTest, UserTest } from './test-utils';
import { WsEventName } from '@messanger/types';

describe('GET Conversation', () => {
  beforeEach(async () => {
    await UserTest.create(usersTest[0]);
    await ProfileTest.create({
      userId: usersTest[0].id,
      profile: {
        firstName: 'Test',
        lastName: 'User',
        avatar: 'https://example.com/avatar.jpg',
      },
    });
    await UserTest.create(usersTest[1]);
    await ProfileTest.create({
      userId: usersTest[1].id,
      profile: {
        firstName: 'Receiver',
        lastName: 'User',
        avatar: 'https://example.com/avatar.jpg',
      },
    });
    await ThreadTest.create({
      id: '1',
      type: 'PRIVATE',
      creatorId: usersTest[0].id,
      participantIds: [usersTest[0].id, usersTest[1].id],
    });
    await ConversationTest.create({
      id: '1',
      content: 'Hello, this is a test message!',
      senderId: usersTest[0].id,
      threadId: '1',
    });
    await ConversationStatusTest.create({
      id: 'status-1',
      userId: usersTest[0].id,
      conversationId: '1',
      isDeleted: false,
    });

    await ConversationStatusTest.create({
      id: 'status-2',
      userId: usersTest[1].id,
      conversationId: '1',
      isDeleted: false,
    });

    await ConversationTest.create({
      id: '2',
      content: 'Greetings !',
      senderId: usersTest[1].id,
      threadId: '1',
    });
    await ConversationTest.create({
      id: '3',
      content: 'Greetings !',
      senderId: usersTest[1].id,
      threadId: '1',
    });
  });
  it('should get all conversations in a Thread', async () => {
    const response = await fetch('http://localhost:3000/api/threads/1', {
      method: 'GET',
      headers: { Authorization: usersTest[0].token },
    });
    console.log('Get conversations response status:', response);
    const body = await response.json();
    console.log('Get conversations response:', body);

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    //expect(Array.isArray(body.data)).toBe(true);
  });

  it('should show detail conversations', async () => {
    const response = await fetch('http://localhost:3000/api/threads/1/conversations/1', {
      method: 'GET',
      headers: { Authorization: usersTest[0].token },
    });
    console.log('Get conversations response status:', response);
    const body = await response.json();
    console.log('Get conversations response:', body);

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    //expect(Array.isArray(body.data)).toBe(true);
  });

  it('should show search result conversations', async () => {
    const response = await fetch('http://localhost:3000/api/threads/1?search=Hello', {
      method: 'GET',
      headers: { Authorization: usersTest[0].token },
    });
    console.log('Get conversations response status:', response);
    const body = await response.json();
    console.log('Get conversations response:', body);

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });

  it('should show conversations with pagination', async () => {
    const response = await fetch('http://localhost:3000/api/threads/1?page=1&pageSize=2', {
      method: 'GET',
      headers: { Authorization: usersTest[0].token },
    });
    console.log('Get conversations with pagination response status:', response);
    const body = await response.json();
    console.log('Get conversations with pagination response:', body);

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    //xpect(body.data.items.length).toBeLessThanOrEqual(2);
  });

  it('should return empty array if no conversations found', async () => {
    const response = await fetch('http://localhost:3000/api/threads/1?search=NonExistent', {
      method: 'GET',
      headers: { Authorization: usersTest[0].token },
    });
    console.log('Get conversations with no results response status:', response);

    const body = await response.json();
    console.log('Get conversations with no results response:', body);
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });

  it('should return conversations with sorting', async () => {
    const response = await fetch('http://localhost:3000/api/threads/1?sortBy=createdAt&sortOrder=asc', {
      method: 'GET',
      headers: { Authorization: usersTest[0].token },
    });
    console.log('Get conversations with sorting response status:', response);
    const body = await response.json();
    console.log('Get conversations with sorting response:', body);
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });

  it('should return conversations with filtering', async () => {
    const response = await fetch('http://localhost:3000/api/threads/1?senderId=id-test2', {
      method: 'GET',
      headers: { Authorization: usersTest[0].token },
    });
    console.log('Get conversations with filtering response status:', response);
    const body = await response.json();
    console.log('Get conversations with filtering response:', body);
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });

  afterEach(async () => {
    await ThreadTest.deleteAll();
    await UserTest.delete(usersTest[0].username);
    await UserTest.delete(usersTest[1].username);
    await ProfileTest.deleteAll();
    await ConversationTest.deleteAll();
    await ConversationStatusTest.deleteAll();
  });
});

describe('POST Conversation', () => {
  beforeEach(async () => {
    await UserTest.create(usersTest[0]);
    await ProfileTest.create({
      userId: usersTest[0].id,
      profile: {
        firstName: 'Test',
        lastName: 'User',
        avatar: 'https://example.com/avatar.jpg',
      },
    });
    await UserTest.create(usersTest[1]);
    await ProfileTest.create({
      userId: usersTest[1].id,
      profile: {
        firstName: 'Test',
        lastName: 'User',
        avatar: 'https://example.com/avatar.jpg',
      },
    });
    await ThreadTest.create({
      id: '1',
      type: 'PRIVATE',
      creatorId: usersTest[0].id,
      participantIds: [usersTest[0].id, usersTest[1].id],
    });
  });
  it('should create a new conversation', async () => {
    const response = await fetch('http://localhost:3000/api/threads/1/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: usersTest[0].token,
      },
      body: JSON.stringify({
        content: 'Hello, this is a test message!',
        threadId: '1',
      }),
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
    await UserTest.deleteAll();
    await ProfileTest.deleteAll();
    await ThreadTest.deleteAll();
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
      threadId: '1',
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
          const getResponse = await fetch('http://localhost:3000/api/threads/1/conversations', {
            method: 'GET',
            headers: { Authorization: usersTest[1].token },
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
              const delResponse = await fetch(`http://localhost:3000/api/threads/1/conversations', {/${conversationId}`, {
                method: 'DELETE',
                headers: { Authorization: usersTest[0].token },
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
