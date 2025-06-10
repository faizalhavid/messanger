import { Hono } from 'hono'
import { cors } from 'hono/cors';
import { HonoContext } from '@messanger/types';
import { userController } from './user/controllers/user-controller'
import { authController } from './auth/controllers/auth-controller';
import { profileController } from './user/controllers/profile-controller';
import { errorHandler } from './handlers/error-handler';
import { authMiddleware } from './middleware';
import { websocket, webSocketConfig } from './websocket/config';
import { conversationController } from './conversation/controllers/conversation-controller';
import { conversationGroupController } from './conversation/controllers/conversation-group-controller';
import { conversationGroupMessagesController } from './conversation/controllers/conversation-group-message-controller';
import { ConversationTest, ProfileTest, usersTest, UserTest } from 'tests/test-utils';


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
    await ProfileTest.deleteAll();
    await UserTest.deleteAll();
    await ConversationTest.deleteAll();
    // Seed the database with initial data
    await UserTest.create(usersTest[0]);
    await ProfileTest.create({
        userId: usersTest[0].id,
        profile: {
            firstName: 'John',
            lastName: 'Doe',
            avatar: 'https://example.com/avatar.jpg',
        }
    });
    await UserTest.create(usersTest[1]);
    await ProfileTest.create({
        userId: usersTest[1].id,
        profile: {
            firstName: 'Jane',
            lastName: 'Doe',
            avatar: 'https://example.com/avatar2.jpg',
        }
    });
    await ConversationTest.create({
        id: '1',
        content: 'Hello, this is a test conversation',
        senderId: usersTest[0].id,
        receiverId: usersTest[1].id,
    });
    await ConversationTest.create({
        id: '2',
        content: 'Hello, this is another test conversation',
        senderId: usersTest[1].id,
        receiverId: usersTest[0].id,
    });
    await ConversationTest.create({
        id: '3',
        content: 'This is a group conversation',
        senderId: usersTest[0].id,
        receiverId: usersTest[1].id
    });
    await ConversationTest.create({
        id: '4',
        content: 'This is a group conversation with multiple users',
        senderId: usersTest[1].id,
        receiverId: usersTest[0].id
    });

    await ConversationTest.create({
        id: '5',
        content: 'This is a group conversation with multiple users',
        senderId: usersTest[0].id,
        receiverId: usersTest[1].id
    });

    await ConversationTest.create({
        id: '6',
        content: 'This is a group conversation with multiple users',
        senderId: usersTest[1].id,
        receiverId: usersTest[0].id
    });

    await ConversationTest.create({
        id: '7',
        content: 'This is a group conversation with multiple users',
        senderId: usersTest[0].id,
        receiverId: usersTest[1].id
    });
    return c.text('Database seeded');
});

api.get('', (c) => c.text('Hello Hono!'))
api.route('/users', userController);
api.route('/auth', authController);
api.route('/profile', profileController);
api.route('/conversations', conversationController);
api.route('/conversation-groups', conversationGroupController);
api.route('/conversation-groups-messages', conversationGroupMessagesController);

app.route('/api', api);

export default app;

export const server = Bun.serve({ fetch: app.fetch, port: 3000, websocket });