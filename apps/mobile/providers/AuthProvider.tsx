import { useAuthStore } from "@/store/auth";
import { UserPublic } from "@messanger/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect } from "react";

type Props = {
    children: React.ReactNode;
    credentialsState: {
        token: string | null;
        user: UserPublic | null;
        setUser: (user: UserPublic | null) => void;
        setToken: (token: string) => void;
        setLoading: (loading: boolean) => void;
    }
};

const AuthProvider = ({ children, credentialsState: authData }: Props) => {
    const { token, user, setUser, setToken, setLoading } = authData;

    useEffect(() => {
        const bootstrap = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('token');
                const storedUser = await AsyncStorage.getItem('user');
                console.log('Loaded token from storage:', storedToken);
                if (storedToken && storedToken !== token) {
                    setToken(storedToken);
                }
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (e) {
                // Optional: handle error
                console.error("Failed to load token", e);
            } finally {
                setLoading(false);
            }
        };
        bootstrap();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <>{children}</>;
};

export default AuthProvider;