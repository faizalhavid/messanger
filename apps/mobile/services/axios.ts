import { useAuthStore } from "@/store/(auth)";
import axios from "axios";

const instance = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

instance.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

instance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle errors globally
        if (error.response && error.response.status === 401) {
            // Optionally handle un(auth)orized access, e.g., redirect to login
            console.error("Un(auth)orized access - redirecting to login");
        }
        return Promise.reject(error);
    }
);

export default instance;
