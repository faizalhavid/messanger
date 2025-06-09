import { ConversationPublic, PaginatedResponse } from "@messanger/types";
import axios from "axios";


export const getConversations = async (): Promise<PaginatedResponse<ConversationPublic>> => {
    try {
        const response = await axios.get("/conversations", {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status !== 200) {
            throw new Error("Failed to fetch messages");
        }

        const data: PaginatedResponse<ConversationPublic> = response.data;
        return data;
    } catch (error) {
        console.error("Error fetching messages:", error);
        throw error;
    }
}