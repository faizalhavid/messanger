export const conversationKeys = {
    all: ['conversation'] as const,
    detail: (id: string) => ['conversation', id] as const,
};