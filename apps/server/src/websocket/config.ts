import { createBunWebSocket } from 'hono/bun';
import { ServerWebSocket } from 'bun';
import { Context } from 'hono';
import { UserService } from 'src/user/services/user-service';
import { WsTopic, AppWSContext, WsBroadcastEvent, WsEventName } from './websocket';

export const { upgradeWebSocket, websocket } = createBunWebSocket();
const ALLOWED_TOPICS = [WsTopic.Messages, WsTopic.Notifications];

export const webSocketConfig = upgradeWebSocket(async (c: Context) => {
    const topic = (c.req.query('topic') || 'messages') as WsTopic; // example url: /ws?topic=messages, /ws?topic=notifications
    if (!ALLOWED_TOPICS.includes(topic)) {
        return rejectConnection(4000, `Invalid topic: ${topic}. Allowed topics are: ${ALLOWED_TOPICS.join(', ')}`);
    }

    return {
        onOpen(_, ws: AppWSContext) {
            const rawWs = ws.raw as ServerWebSocket;
            rawWs.subscribe(topic);
            console.log(`WebSocket server opened and subscribed to topic '${topic}'`);
        },
        async onMessage(evt, ws: AppWSContext) {
            const rawWs = ws.raw as ServerWebSocket;
            let payload: WsBroadcastEvent;
            try {
                payload = JSON.parse(evt.data as string) as WsBroadcastEvent;
            } catch (e) {
                ws.close(4003, "Invalid message format");
                return;
            }

            if (!ws.data?.isAuthenticated) {
                if (payload.event === WsEventName.Authentication && payload.data?.token) {
                    try {
                        const user = await UserService.getUser(payload.data.token);
                        if (user) {
                            ws.data = { isAuthenticated: true, user, topic };
                            rawWs.send(JSON.stringify({ event: "auth-success" }));
                            console.log("WebSocket authenticated");
                        } else {
                            ws.close(4002, "Unauthorized: Invalid token");
                            return;
                        }
                    } catch (err) {
                        ws.close(4002, "Unauthorized: Invalid token");
                        return;
                    }
                } else {
                    ws.close(4001, "Unauthorized: Please authenticate first");
                    return;
                }
            }
            // Setelah autentikasi, handle event lain seperti biasa
            if (payload.event && payload.data) {
                handlePayloadEvent(payload, ws.data);
                rawWs.publish(topic, JSON.stringify(payload));
                console.log(`Broadcasted event '${payload.event}' to topic '${topic}'`);
            } else {
                console.warn('Invalid WebSocket message format:', evt.data);
            }
        },
        onClose(_, ws: AppWSContext) {
            const rawWs = ws.raw as ServerWebSocket;
            rawWs.unsubscribe(topic);
            console.log(`WebSocket server closed and unsubscribed from topic '${topic}'`);
        },
    }
});

function handlePayloadEvent(payload: WsBroadcastEvent, data: AppWSContext["data"]) {
    switch (payload.event) {

        case WsEventName.UserTyping:
            // Handle user typing event
            console.log('User typing:', payload.data);
            break;
        case WsEventName.UserOnline:
            // Handle user online event
            console.log('User online:', payload.data);
            break;
        case WsEventName.UserOffline:
            // Handle user offline event
            console.log('User offline:', payload.data);
            break;
        case WsEventName.UserStatusChange:
            // Handle user status change event
            console.log('User status change:', payload.data);
            break;

        case WsEventName.MessageRead:
            // Handle message read event
            console.log('Message read:', payload.data);
            break;

        default:
            console.warn('Unknown WebSocket event:', payload.event);
    }
}

function rejectConnection(code: number, reason: string) {
    return {
        onOpen(_: unknown, ws: AppWSContext) {
            ws.close(code, reason);
            console.warn(`WebSocket connection rejected: ${reason}`);
        }
    };
}

