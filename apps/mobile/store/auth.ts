
import { UserPublic } from "@messanger/types/src/user/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";


type AuthState = {
    token: string | null;
    user: UserPublic | null;
    isLoading: boolean;
    setUser: (user: UserPublic | null) => void;
    setToken: (token: string) => void;
    logout: () => void;
    isAuthenticated: () => boolean;
    setLoading: (loading: boolean) => void;
};

const saveTokenToStorage = async (token: string) => {
    try {
        if (!token) {
            await AsyncStorage.removeItem('token');
            return;
        }
        console.log('Saving token to storage:', token);
        await AsyncStorage.setItem('token', token);
    } catch (error) {
        console.error('Error saving token to storage:', error);
    }
};

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    user: null,
    isLoading: false,
    setUser: (user) => {
        set({ user, isLoading: false });
    },
    setToken: (token) => {
        console.log('Setting token:', token);
        set({ token, isLoading: false });
        saveTokenToStorage(token);
    },
    logout: () => {
        set({ token: null, user: null });
        saveTokenToStorage('');
    },
    isAuthenticated: (): boolean => {
        const state = useAuthStore.getState();
        return !!state.token && !!state.user;
    },
    setLoading: (loading) => set({ isLoading: loading }),
}));
