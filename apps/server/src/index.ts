import { Hono } from 'hono'
import { HonoContext } from '@types/hono-context';
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
app.use(authMiddleware);
app.onError(errorHandler);
app.get('/', (c) => c.text('Hello Hono!'))
app.route('/users', userController);
app.route('/auth', authController);
app.route('/profile', profileController);
app.route('/messages', messagesController);
app.route('/message-groups', messageGroupsController);
app.route('/group-messages', groupMessagesController);
export default app;

export const server = Bun.serve({ fetch: app.fetch, port: 3000, websocket });
