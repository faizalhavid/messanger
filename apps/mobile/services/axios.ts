import { useAuthStore } from "@/store/auth";
import axios from "axios";

const instance = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

instance.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `${token}`;
    }
    return config;
});

instance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle errors globally
        if (error.response && error.response.status === 401) {
            // Optionally handle un(auth)orized access, e.g., redirect to login
            console.error("Unauthorized access - redirecting to login");
        }
        if (error.config && error.config.url) {
            console.log("Path:", error.config);
            console.log("Errors:", error);
            console.log("response : ", error._response)

        }
        return Promise.reject(error);
    }
);

export default instance;
