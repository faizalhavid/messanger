import { queryClient } from '@/services/queries';
import { conversationKeys } from '@/services/queries/conversations-query';
import { useMessageStore } from '@/store/message';
import { ConversationPublic, WsEventName, WsTopic } from '@messanger/types';
import React, { createContext, useCallback, useContext, useEffect, useRef } from 'react';

type WebSocketContextType = {
  socket: WebSocket | null;
  sendEvent: (event: WsEventName, data: any) => void;
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);

type WebSocketProviderProps = {
  token: string | null;
  user: { id: string };
  children: React.ReactNode;
};

export const WebSocketProvider = ({ token, user, children }: WebSocketProviderProps) => {
  const wsRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    if (!token && !user) return;
    const ws = new WebSocket(`${process.env.EXPO_PUBLIC_WEBSOCKET_URL}?topic=${WsTopic.Conversations}`);
    wsRef.current = ws;
    ws.onopen = () => ws.send(JSON.stringify({ event: WsEventName.Authentication, data: { token } }));
    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      console.log('WebSocket message received:', payload);
      if (payload.event === WsEventName.ConversationCreated) {
        const newMessage = payload.data as ConversationPublic;
        queryClient.setQueryData(conversationKeys.all(newMessage.threadId ?? ''), (old: any) => {
          if (old && old.data && Array.isArray(old.data.items)) {
            return {
              ...old,
              data: {
                ...old.data,
                items: [...old.data.items, newMessage],
              },
            };
          }
          return {
            data: { items: [newMessage] },
            meta: {},
            message: '',
            success: true,
          };
        });
        //queryClient.invalidateQueries({ queryKey: conversationKeys.detail(interlocutorId) });
      }
    };
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    ws.onclose = () => {
      console.log('WebSocket connection closed');
      wsRef.current = null;
    };
    if (!token) {
      console.warn('WebSocket connection not established due to missing token');
      return;
    }
    return () => ws.close();
  }, [token]);

  const sendEvent = useCallback((event: WsEventName, data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event, data }));
    } else {
      console.warn("WebSocket not connected, can't send:", event);
    }
  }, []);

  return <WebSocketContext.Provider value={{ socket: wsRef.current, sendEvent }}>
    {children}
  </WebSocketContext.Provider>
};

export function useWebSocket() {
  return useContext(WebSocketContext);
}
