import { saveDataToLocalStorage } from '@/utils/local-storage';
import { UserPublic } from '@messanger/types/src/user/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

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

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: false,
  setUser: (user) => {
    set({ user, isLoading: false });
    saveDataToLocalStorage('user', user);
  },
  setToken: (token) => {
    set({ token, isLoading: false });
    saveDataToLocalStorage('token', token);
  },
  logout: () => {
    set({ token: null, user: null });
    saveDataToLocalStorage('token', '');
    saveDataToLocalStorage('user', '');
  },
  isAuthenticated: (): boolean => {
    const state = useAuthStore.getState();
    return !!state.token && !!state.user;
  },
  setLoading: (loading) => set({ isLoading: loading }),
}));
