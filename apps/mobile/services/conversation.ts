import { ConversationPublic, ConversationRequest, ListUserConversationsResponse, PaginatedResponse } from "@messanger/types";
import axios from "./axios";


export const getConversations = async (): Promise<PaginatedResponse<ConversationPublic>> => {
    try {
        const response = await axios.get("/conversations");
        console.log("Response from getConversations:", response);
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

export const getConversationById = async (id: string): Promise<PaginatedResponse<ConversationPublic>> => {
    try {
        const response = await axios.get(`/conversations/${id}`);
        console.log("Response from getConversationById:", response);
        if (response.status !== 200) {
            throw new Error("Failed to fetch conversation");
        }
        const data: PaginatedResponse<ConversationPublic> = response.data;
        return data;
    } catch (error) {
        console.error("Error fetching conversation by ID:", error);
        throw error;
    }
}

export const postConversation = async (req: ConversationRequest): Promise<ConversationPublic> => {
    try {
        const response = await axios.post("/conversations", req);
        console.log("Response from postConversation:", response);
        // Todo: after implement error handling and custome server code at backend, must use 201
        if (response.status !== 200) {
            throw new Error("Failed to create conversation");
        }
        return response.data;
    } catch (error) {
        console.error("Error creating conversation:", error);
        throw error;
    }
}