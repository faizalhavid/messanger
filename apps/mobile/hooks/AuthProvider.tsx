import { useAuthStore } from "@/store/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect } from "react";

type Props = {
    children: React.ReactNode;
};

const AuthProvider = ({ children }: Props) => {
    const { token, setToken, setLoading } = useAuthStore();

    useEffect(() => {
        const bootstrap = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('token');
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