import { MessagePublic, PaginatedResponse } from "@messanger/types";
import axios from "axios";


export const getMessages = async (): Promise<PaginatedResponse<MessagePublic>> => {
    try {
        const response = await axios.get("/messages", {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status !== 200) {
            throw new Error("Failed to fetch messages");
        }

        const data: PaginatedResponse<MessagePublic> = response.data;
        return data;
    } catch (error) {
        console.error("Error fetching messages:", error);
        throw error;
    }
}