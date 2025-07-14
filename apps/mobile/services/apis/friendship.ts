import { FriendshipList, FriendshipRequest, PaginatedResponse, QueryParamsData, UserProfileThread } from '@messanger/types';
import axiosInstance from '../axios';

export const getFriendships = async (queryParams?: QueryParamsData): Promise<PaginatedResponse<FriendshipList>> => {
  try {
    const response = await axiosInstance.get('/friendship', {
      params: queryParams,
    });

    if (response.status !== 200) {
      throw new Error('Failed to fetch friendships');
    }
    const data: PaginatedResponse<FriendshipList> = response.data;
    console.log('Fetched friendships:', data);
    return data;
  } catch (error) {
    console.error('Error fetching friendships:', error);
    throw error;
  }
};

export const postFriendship = async (req: FriendshipRequest): Promise<FriendshipList> => {
  try {
    const response = await axiosInstance.post('/friendship', req);
    if (response.status !== 201) {
      throw new Error('Failed to create friendship');
    }
    return response.data;
  } catch (error) {
    console.error('Error creating friendship:', error);
    throw error;
  }
};

export const putFriendship = async (friendshipId: string, req: FriendshipRequest): Promise<FriendshipList> => {
  try {
    const response = await axiosInstance.put(`/friendship/${friendshipId}`, req);
    if (response.status !== 200) {
      throw new Error('Failed to update friendship');
    }
    return response.data;
  } catch (error) {
    console.error('Error updating friendship:', error);
    throw error;
  }
};

export const deleteFriendship = async (friendshipId: string): Promise<void> => {
  try {
    const response = await axiosInstance.delete(`/friendship/${friendshipId}`);
    if (response.status !== 204) {
      throw new Error('Failed to delete friendship');
    }
  } catch (error) {
    console.error('Error deleting friendship:', error);
    throw error;
  }
};
export const getFriendshipById = async (friendshipId: string): Promise<FriendshipList> => {
  try {
    const response = await axiosInstance.get(`/friendship/${friendshipId}`);
    if (response.status !== 200) {
      throw new Error('Failed to fetch friendship by ID');
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching friendship by ID:', error);
    throw error;
  }
};

export const findFriendship = async (queryParams: QueryParamsData): Promise<PaginatedResponse<UserProfileThread>> => {
  try {
    const response = await axiosInstance.get('/friendship/find', {
      params: queryParams,
    });
    if (response.status !== 200) {
      throw new Error('Failed to find friendship');
    }
    return response.data;
  } catch (error) {
    console.error('Error finding friendship:', error);
    throw error;
  }
};
