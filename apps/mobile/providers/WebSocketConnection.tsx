import { queryClient } from "@/services/queryClient";
import { conversationKeys } from "@/services/queryKeys";
import { useMessageStore } from "@/store/message";
import { ConversationPublic, WsEventName, WsTopic } from "@messanger/types";
import React, { createContext, useContext, useEffect, useRef } from "react";

const WebSocketContext = createContext<WebSocket | null>(null);

type WebSocketProviderProps = {
    token: string | null;
    user: { id: string };
    children: React.ReactNode;
};

export const WebSocketProvider = ({ token, user, children }: WebSocketProviderProps) => {
    const wsRef = useRef<WebSocket | null>(null);
    useEffect(() => {
        if (!token) return;
        const ws = new WebSocket(`${process.env.EXPO_PUBLIC_WEBSOCKET_URL}?topic=${WsTopic.Conversations}`);
        wsRef.current = ws;
        ws.onopen = () => ws.send(JSON.stringify({ event: WsEventName.Authentication, data: { token } }));
        ws.onmessage = (event) => {
            const payload = JSON.parse(event.data);
            console.log("WebSocket message received:", payload);
            if (payload.event === WsEventName.ConversationCreated) {
                const interlocutorId = user.id === payload.data.senderId ? payload.data.receiverId : payload.data.senderId;
                const newMessage = payload.data as ConversationPublic;
                queryClient.setQueryData(conversationKeys.detail(interlocutorId ?? ''), (old: any) => {
                    console.log("Old data", old);
                    const items = old?.data?.items ?? [];
                    return {
                        ...old,
                        data: {
                            ...(old?.data ?? {}),
                            items: [...items, newMessage],
                        }
                    };
                });
                //queryClient.invalidateQueries({ queryKey: conversationKeys.detail(interlocutorId) });

            }
        };
        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
        ws.onclose = () => {
            console.log("WebSocket connection closed");
            wsRef.current = null;
        };
        if (!token) {
            console.warn("WebSocket connection not established due to missing token");
            return;
        }
        return () => ws.close();
    }, [token]);

    return (
        <WebSocketContext.Provider value={wsRef.current}>
            {children}
        </WebSocketContext.Provider>
    );
};

export function useWebSocket() {
    return useContext(WebSocketContext);
}