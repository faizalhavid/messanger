import { ConversationPublic } from "@messanger/types";
import { create } from "zustand";



type MessageState = {
    messages: Record<string, ConversationPublic[]>;
    addMessage: (msg: ConversationPublic) => void;
    setMessages: (msg: ConversationPublic[]) => void;
    removeMessage: (messageId: string) => void;
    updateMessage: (message: ConversationPublic) => void;
    clearMessages: () => void;
};


export const useMessageStore = create<MessageState>((set) => ({
    messages: {},
    addMessage: (msg: ConversationPublic) =>
        set((state) => {
            const cid = msg.id;
            const existingMessages = state.messages[cid] || [];
            return {
                messages: {
                    ...state.messages,
                    [cid]: [...existingMessages, msg],
                },
            };
        }
        ),
    setMessages: (msgs) =>
        set((state) => {
            const newMessages = msgs.reduce((acc, msg) => {
                if (!acc[msg.id]) {
                    acc[msg.id] = [];
                }
                acc[msg.id].push(msg);
                return acc;
            }, {} as Record<string, ConversationPublic[]>);

            return { messages: { ...state.messages, ...newMessages } };
        }),

    removeMessage: (messageId) => set((state) => {
        const newMessages = { ...state.messages };
        Object.keys(newMessages).forEach((cid) => {
            newMessages[cid] = newMessages[cid].filter(msg => msg.id !== messageId);
        });
        return { messages: newMessages };
    }
    ),
    updateMessage: (message) => set((state) => {
        const newMessages = { ...state.messages };
        if (newMessages[message.id]) {
            newMessages[message.id] = newMessages[message.id].map(msg =>
                msg.id === message.id ? message : msg
            );
        }
        return { messages: newMessages };
    }
    ),
    clearMessages: () => set({ messages: {} })
}));
