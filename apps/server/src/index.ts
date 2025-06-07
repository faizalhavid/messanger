import { Hono } from 'hono'
import { cors } from 'hono/cors';
import { HonoContext } from '@messanger/types';
import { userController } from './user/controllers/user-controller'
import { authController } from './auth/controllers/auth-controller';
import { profileController } from './user/controllers/profile-controller';
import { messagesController } from './message/controllers/message-controller';
import { messageGroupsController } from './message/controllers/message-groups-controller';
import { groupMessagesController } from './message/controllers/group-messages-controller';
import { errorHandler } from './handlers/error-handler';
import { authMiddleware } from './middleware';
import { websocket, webSocketConfig } from './websocket/config';


const app = new Hono<{ Variables: HonoContext }>();

app.get('/ws', webSocketConfig);

const api = new Hono<{ Variables: HonoContext }>();

api.use(authMiddleware);
app.use('*', cors({
    origin: 'http://localhost:8081',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
api.onError(errorHandler);
api.get('', (c) => c.text('Hello Hono!'))
api.route('/users', userController);
api.route('/auth', authController);
api.route('/profile', profileController);
api.route('/messages', messagesController);
api.route('/message-groups', messageGroupsController);
api.route('/group-messages', groupMessagesController);

app.route('/api', api);

export default app;

export const server = Bun.serve({ fetch: app.fetch, port: 3000, websocket });