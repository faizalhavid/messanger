import { ConversationPublic, ConversationRequest, PaginatedResponse, QueryParamsData } from '@messanger/types';
import axiosInstance from '../axios';

export const getConversations = async (threadId: string, queryParams?: QueryParamsData): Promise<PaginatedResponse<ConversationPublic>> => {
  try {
    const response = await axiosInstance.get(`/threads/${threadId}/conversations`, { params: queryParams });
    if (response.status !== 200) {
      throw new Error('Failed to fetch messages');
    }

    const data: PaginatedResponse<ConversationPublic> = response.data;
    return data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const getConversationById = async (id: string, threadId: string): Promise<PaginatedResponse<ConversationPublic>> => {
  try {
    const response = await axiosInstance.get(`/threads/${threadId}/conversations/${id}`);
    //console.log("Response from getConversationById:", response);
    if (response.status !== 200) {
      throw new Error('Failed to fetch conversation');
    }
    const data: PaginatedResponse<ConversationPublic> = response.data;
    return data;
  } catch (error) {
    console.error('Error fetching conversation by ID:', error);
    throw error;
  }
};

export const postConversation = async (threadId: string, req: ConversationRequest): Promise<ConversationPublic> => {
  try {
    const response = await axiosInstance.post(`/threads/${threadId}/conversations`, req);
    //console.log("Response from postConversation:", response);
    // Todo: after implement error handling and custome server code at backend, must use 201
    if (response.status !== 200) {
      throw new Error('Failed to create conversation');
    }
    return response.data;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

export const putConversation = async (id: string, threadId: string, req: ConversationRequest): Promise<ConversationPublic> => {
  try {
    const response = await axiosInstance.put(`/threads/${threadId}/conversations/${id}`, req);
    //console.log("Response from putConversation:", response);
    if (response.status !== 200) {
      throw new Error('Failed to update conversation');
    }
    return response.data;
  } catch (error) {
    console.error('Error updating conversation:', error);
    throw error;
  }
};

export const deleteConversation = async (id: string, threadId: string): Promise<void> => {
  try {
    const response = await axiosInstance.delete(`/threads/${threadId}/conversations/${id}`);
    //console.log("Response from deleteConversation:", response);
    if (response.status !== 200) {
      throw new Error('Failed to delete conversation');
    }
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
};
