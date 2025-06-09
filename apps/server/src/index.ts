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


const app = new Hono<{ Variables: HonoContext }>();
app.use('*', cors({
    origin: [
        'http://localhost:8081', // untuk web/dev
        'http://localhost:19006', // Metro bundler (Expo Go web)
        'http://localhost:19000', // Expo Go devtools
        'http://10.0.2.2:8081',   // Android emulator (akses ke host)
        'http://10.0.2.2:19006',  // Expo Go di emulator
        'http://10.0.3.2:8081',   // Genymotion emulator
        'http://127.0.0.1:8081',  // kadang emulator pakai ini juga
    ],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.get('/ws', webSocketConfig);

const api = new Hono<{ Variables: HonoContext }>();

api.use(authMiddleware);
api.onError(errorHandler);
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