import { useAuthStore } from '@/store/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://9.201.247.57:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle errors globally

    console.error('Axios error:', error);
    if (error.response && error.response.status === 401) {
      // Optionally handle un(auth)orized access, e.g., redirect to login
    }
    if (error.response && error.status === 403) {
      // Optionally handle forbidden access, e.g., show a message:
      console.error('Forbidden access:', error.response.data);
      await AsyncStorage.removeItem('token');
      await useAuthStore.getState().logout();
    }
    if (error.config && error.config.url) {
      console.error('Request URL:', error.config.url);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
