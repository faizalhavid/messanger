import { Stack } from "expo-router";
import React from "react";



export default function AuthLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="register" />
            <Stack.Screen name="forgot-password" />
            {/* <Stack.Screen name="reset-password" options={{ headerShown: false }} /> */}
        </Stack>
    );
}