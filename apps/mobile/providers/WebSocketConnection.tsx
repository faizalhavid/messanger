import { WsEventName } from "@messanger/types";
import React, { createContext, useContext, useEffect, useRef } from "react";

const WebSocketContext = createContext<WebSocket | null>(null);

type WebSocketProviderProps = {
    token: string | null;
    children: React.ReactNode;
};

export const WebSocketProvider = ({ token, children }: WebSocketProviderProps) => {
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`${process.env.EXPO_PUBLIC_WEBSOCKET_URL}?topic=conversations`);
        wsRef.current = ws;
        ws.onopen = () => ws.send(JSON.stringify({ event: WsEventName.Authentication, data: { token } }));
        ws.onmessage = (event) => {
            const payload = JSON.parse(event.data);
            if (payload.event === WsEventName.ConversationCreated) {
                // Handle the conversation created event
                console.log("New conversation created:", payload.data);
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