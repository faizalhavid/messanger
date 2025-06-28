import { PaginatedResponse, QueryParamsData, ThreadList, ThreadRequest } from '@messanger/types';
import axiosInstance from '../axios';

export const getThreads = async (queryParams?: QueryParamsData): Promise<PaginatedResponse<ThreadList>> => {
  try {
    const response = await axiosInstance.get('/threads', {
      params: queryParams,
    });

    if (response.status !== 200) {
      throw new Error('Failed to fetch threads');
    }
    const data: PaginatedResponse<ThreadList> = response.data;
    return data;
  } catch (error) {
    console.error('Error fetching threads:', error);
    throw error;
  }
};

export const getConversationsByThreadId = async (threadId: string, conversationQueryParams?: QueryParamsData): Promise<PaginatedResponse<ThreadList>> => {
  try {
    const response = await axiosInstance.get(`/threads/${threadId}`, {
      params: conversationQueryParams,
    });

    if (response.status !== 200) {
      throw new Error('Failed to fetch thread by ID');
    }
    const data: PaginatedResponse<ThreadList> = response.data;
    return data;
  } catch (error) {
    console.error('Error fetching thread by ID:', error);
    throw error;
  }
};

export const postThread = async (req: ThreadRequest): Promise<ThreadList> => {
  try {
    const response = await axiosInstance.post('/threads', req);
    if (response.status !== 201) {
      throw new Error('Failed to create thread');
    }
    return response.data;
  } catch (error) {
    console.error('Error creating thread:', error);
    throw error;
  }
};

export const updateThread = async (threadId: string, req: ThreadRequest): Promise<ThreadList> => {
  try {
    const response = await axiosInstance.put(`/threads/${threadId}`, req);
    if (response.status !== 200) {
      throw new Error('Failed to update thread');
    }
    return response.data;
  } catch (error) {
    console.error('Error updating thread:', error);
    throw error;
  }
};

export const updateThreadAvatar = async (threadId: string, avatar: File): Promise<ThreadList> => {
  const formData = new FormData();
  formData.append('avatar', avatar);

  try {
    const response = await axiosInstance.put(`/threads/${threadId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (response.status !== 200) {
      throw new Error('Failed to update thread avatar');
    }
    return response.data;
  } catch (error) {
    console.error('Error updating thread avatar:', error);
    throw error;
  }
};

export const deleteThread = async (threadId: string): Promise<void> => {
  try {
    const response = await axiosInstance.delete(`/threads/${threadId}`);
    if (response.status !== 204) {
      throw new Error('Failed to delete thread');
    }
  } catch (error) {
    console.error('Error deleting thread:', error);
    throw error;
  }
};
