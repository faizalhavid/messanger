import { HonoContext, WsEventName, WsTopic } from '@messanger/types';
import { Hono } from 'hono';
import { ThreadService } from '../services/thread-service';
import { server } from 'src';
import { generateWSBroadcastPayload } from 'src/websocket/config';

export const threadController = new Hono<{ Variables: HonoContext }>();
const controller = threadController;

controller.get('/', async (c) => {
  const user = c.get('authenticatedUser');
  const queryParams = c.req.query();
  const { items, meta } = await ThreadService.getThreads(user.id, queryParams);
  return c.json({
    success: true,
    message: 'Threads retrieved successfully',
    data: { items, meta },
  });
});

controller.get('/:id', async (c) => {
  const user = c.get('authenticatedUser');
  const threadId = c.req.param('id');
  const queryParams = c.req.query();
  const { meta, items, thread } = await ThreadService.getThreadConversations(threadId, user.id, queryParams);

  return c.json({
    success: true,
    message: 'Thread retrieved successfully',
    data: { thread, items, meta },
  });
});

controller.post('/', async (c) => {
  const user = c.get('authenticatedUser');
  const request = await c.req.json();
  const result = await ThreadService.createThread(request, user.id);
  return c.json({
    success: true,
    message: 'Thread created successfully',
    data: result,
  });
});

controller.patch('/:id', async (c) => {
  const user = c.get('authenticatedUser');
  const request = await c.req.json();
  const threadId = c.req.param('id');
  const result = await ThreadService.updateThread(request, threadId, user.id);
  return c.json({
    success: true,
    message: 'Thread updated successfully',
    data: result,
  });
});

controller.patch('/:id', async (c) => {
  const user = c.get('authenticatedUser');
  const image = c.req.json();
  const threadId = c.req.param('id');
  if (!image) {
    return c.json(
      {
        success: false,
        message: 'No image provided',
        data: null,
      },
      400
    );
  }
  const result = await ThreadService.uploadThreadAvatar(threadId, user.id, await image);
  return c.json({
    success: true,
    message: 'Thread image updated successfully',
    data: result,
  });
});

controller.delete('/:id', async (c) => {
  const user = c.get('authenticatedUser');
  const threadId = c.req.param('id');
  await ThreadService.deleteThread(threadId, user.id);
  return c.json({
    success: true,
    message: 'Thread deleted successfully',
    data: null,
  });
});
