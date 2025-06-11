import { useAuthStore } from "@/store/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect } from "react";

type Props = {
    children: React.ReactNode;
    credentialsState: {
        token: string | null;
        setToken: (token: string) => void;
        setLoading: (loading: boolean) => void;
    }
};

const AuthProvider = ({ children, credentialsState: authData }: Props) => {
    const { token, setToken, setLoading } = authData;

    useEffect(() => {
        const bootstrap = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('token');
                console.log('Loaded token from storage:', storedToken);
                if (storedToken && storedToken !== token) {
                    setToken(storedToken);
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