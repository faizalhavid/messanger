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
            }}
            initialRouteName="login"
        >
            <Stack.Screen name="login"
                options={{
                    statusBarHidden: true,
                    title: "Connect to your account",
                    headerShown: true,
                    headerTitleAlign: "center",
                    headerTitleStyle: {
                        fontSize: 20,
                        fontWeight: "600",
                    },
                    headerRight: () => <Button mode="text" onPress={() => route.replace('/auth/register')}>Register</Button>
                }}
            />
            <Stack.Screen name="register" />
            <Stack.Screen name="forgot-password" />
        </Stack>
    );
}