import { Hono } from 'hono'
import { cors } from 'hono/cors';
import { HonoContext } from '@messanger/types';
import { userController } from './user/controllers/user-controller'
import { authController } from './auth/controllers/auth-controller';
import { errorHandler } from './handlers/error-handler';
import { authMiddleware } from './middleware';
import { websocket, webSocketConfig } from './websocket/config';
import { conversationController } from './conversation/controllers/conversation-controller';
import { ConversationStatusTest, ConversationTest, ProfileTest, ThreadTest, usersTest, UserTest } from 'tests/test-utils';
import { threadController } from './thread/controllers/thread-controller';
import { threadParticipantsController } from './thread/controllers/thread-participants-controller';
import { friendshipController } from './user/controllers/friendship-controller';
import { conversationMarkersController } from './marker-object/controllers/conversation-markers-controllers';
import { threadMarkersController } from './marker-object/controllers/thread-markers-controllers';
import { friendshipMarkersController } from './marker-object/controllers/friendship-markers-controllers';


const app = new Hono<{ Variables: HonoContext }>();
app.use('*', cors({
    origin: "*",
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.get('/ws', webSocketConfig);

const api = new Hono<{ Variables: HonoContext }>();

api.use(authMiddleware);
api.onError(errorHandler);
// debug only
api.get('/seed', async (c) => {
    await ConversationTest.deleteAll();
    await ConversationStatusTest.deleteAll();
    await ThreadTest.deleteAll();
    await ProfileTest.deleteAll();
    await UserTest.deleteAll();
    // Seed the database with initial data
    await UserTest.create(usersTest[0]);
    await ProfileTest.create({
        userId: usersTest[0].id,
        profile: {
            firstName: 'John',
            lastName: 'Doe',
            avatar: 'https://example.com/avatar.jpg',
            description: 'Lorem Ipsum Dolor sit amet'
        }
    });
    await UserTest.create(usersTest[1]);
    await ProfileTest.create({
        userId: usersTest[1].id,
        profile: {
            firstName: 'Jane',
            lastName: 'Doe',
            avatar: 'https://example.com/avatar2.jpg',
            description: 'Lorem Ipsum Dolor sit amet'
        }
    });
    await UserTest.create(usersTest[2]);
    await ProfileTest.create({
        userId: usersTest[2].id,
        profile: {
            firstName: 'Jane',
            lastName: 'Doe',
            avatar: 'https://example.com/avatar2.jpg',
            description: 'Lorem Ipsum Dolor sit amet'
        }
    });

    await ThreadTest.create({
        id: 'thread-test-1',
        type: 'PRIVATE',
        creatorId: usersTest[0].id,
        participantIds: [usersTest[1].id]
    });
    await ConversationTest.create({
        id: 'conversation-1',
        content: 'Hello, this is a test conversation',
        senderId: usersTest[0].id,
        threadId: 'thread-test-1'
    });
    await ConversationStatusTest.create({
        id: 'status-1',
        userId: usersTest[0].id,
        conversationId: 'conversation-1',
        isDeleted: false,
    });
    await ConversationTest.create({
        id: 'conversation-2',
        content: 'Hello, this is a test conversation 2',
        senderId: usersTest[1].id,
        threadId: 'thread-test-1'
    });
    await ConversationStatusTest.create({
        id: 'status-2',
        userId: usersTest[0].id,
        conversationId: 'conversation-2',
        isDeleted: false,
    });
    await ConversationTest.create({
        id: 'conversation-3',
        content: 'Hello, this is a test conversation 3',
        senderId: usersTest[0].id,
        threadId: 'thread-test-1'
    });
    await ConversationStatusTest.create({
        id: 'status-3',
        userId: usersTest[0].id,
        conversationId: 'conversation-3',
        isDeleted: false,
    });

    await ThreadTest.create({
        id: 'thread-test-2',
        type: 'GROUP',
        creatorId: usersTest[0].id,
        participantIds: [usersTest[1].id, usersTest[2].id]
    });
    await ConversationTest.create({
        id: 'conversation-4',
        content: 'Hello, this is a test conversation from' + usersTest[0].username,
        senderId: usersTest[0].id,
        threadId: 'thread-test-2',
    });
    await ConversationStatusTest.create({
        id: 'status-4',
        userId: usersTest[0].id,
        conversationId: 'conversation-4',
        isDeleted: false,
    });
    await ConversationTest.create({
        id: 'conversation-5',
        content: 'Hello, this is a test conversation from' + usersTest[1].username,
        senderId: usersTest[1].id,
        threadId: 'thread-test-2'
    });
    await ConversationStatusTest.create({
        id: 'status-5',
        userId: usersTest[1].id,
        conversationId: 'conversation-5',
        isDeleted: false,
    });
    await ConversationTest.create({
        id: 'conversation-6',
        content: 'Hello, this is a test conversation from' + usersTest[2].username,
        senderId: usersTest[2].id,
        threadId: 'thread-test-2'
    });
    await ConversationStatusTest.create({
        id: 'status-6',
        userId: usersTest[2].id,
        conversationId: 'conversation-6',
        isDeleted: false,
    });

    // await ConversationTest.create({
    //     id: '2',
    //     content: 'Hello, this is another test conversation',
    //     senderId: usersTest[1].id,
    //     receiverId: usersTest[0].id,
    // });
    // await ConversationTest.create({
    //     id: '3',
    //     content: 'This is a group conversation',
    //     senderId: usersTest[0].id,
    //     receiverId: usersTest[1].id
    // });
    // await ConversationTest.create({
    //     id: '4',
    //     content: 'This is a group conversation with multiple users',
    //     senderId: usersTest[1].id,
    //     receiverId: usersTest[0].id
    // });

    // await ConversationTest.create({
    //     id: '5',
    //     content: 'This is a group conversation with multiple users',
    //     senderId: usersTest[0].id,
    //     receiverId: usersTest[1].id
    // });

    // await ConversationTest.create({
    //     id: '6',
    //     content: 'This is a group conversation with multiple users',
    //     senderId: usersTest[1].id,
    //     receiverId: usersTest[0].id
    // });

    // await ConversationTest.create({
    //     id: '7',
    //     content: 'This is a group conversation with multiple users',
    //     senderId: usersTest[0].id,
    //     receiverId: usersTest[1].id
    // });
    return c.text('Database seeded');
});

api.get('', (c) => c.text('Hello Hono!'))
api.route('/users', userController);
api.route('/auth', authController);


api.route('/threads', threadController);
api.route('/threads/:threadId/markers', threadMarkersController);

api.route('/threads/:threadId/conversations', conversationController);
api.route('/threads/:threadId/conversations/:conversationId/markers', conversationMarkersController);

api.route('/threads/:threadId/participants', threadParticipantsController);


api.route('/friendship', friendshipController);
api.route('/friendship/:friendshipId/markers', friendshipMarkersController);

app.route('/api', api);

export default app;

export const server = Bun.serve({ fetch: app.fetch, port: 3000, websocket });