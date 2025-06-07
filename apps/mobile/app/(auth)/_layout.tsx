import { Stack, useRouter } from "expo-router";
import React from "react";
import { Button } from 'react-native-paper';

export default function AuthLayout() {
    const route = useRouter();
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                headerLeft: () => null,
                gestureEnabled: false,
                animation: "fade_from_bottom",
                animationDuration: 300,
                contentStyle: {
                    height: 500,
                },
            }}
            initialRouteName="login"
        >
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="forgot-password" />
        </Stack>
    );
}