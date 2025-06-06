
import { UserPublic } from "@messanger/types/src/user/user";
import { create } from "zustand";


type AuthState = {
    token: string | null;
    user: UserPublic | null;
    isLoading: boolean;
    setToken: (token: string) => void;
    logout: () => void;
    isAuthenticated: () => boolean;
    setLoading: (loading: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    user: null,
    isLoading: false,
    setToken: (token) => set({ token, isLoading: false }),
    logout: () => set({ token: null, user: null }),
    isAuthenticated: (): boolean => {
        const state = useAuthStore.getState();
        return !!state.token && !!state.user;
    },
    setLoading: (loading) => set({ isLoading: loading }),
}));
