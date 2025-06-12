
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

const saveAuthToStorage = async (key: string, value: any) => {
    try {
        if (value === null || value === undefined || value === '') {
            await AsyncStorage.removeItem(key);
            return;
        }
        const serialized = typeof value === 'string' ? value : JSON.stringify(value);
        await AsyncStorage.setItem(key, serialized);
        console.log(`Saved ${key} to storage:`, value);
    } catch (error) {
        console.error(`Error saving ${key} to storage:`, error);
    }
};

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    user: null,
    isLoading: false,
    setUser: (user) => {
        set({ user, isLoading: false });
        saveAuthToStorage('user', user);
    },
    setToken: (token) => {
        set({ token, isLoading: false });
        saveAuthToStorage('token', token)
    },
    logout: () => {
        set({ token: null, user: null });
        saveAuthToStorage('token', '');
        saveAuthToStorage('user', '');
    },
    isAuthenticated: (): boolean => {
        const state = useAuthStore.getState();
        return !!state.token && !!state.user;
    },
    setLoading: (loading) => set({ isLoading: loading }),
}));
