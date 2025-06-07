// filepath: c:\Users\USER\OneDrive\Dokumen\GitHub\messanger\apps\mobile\app\(auth)\index.tsx
import React, { useState } from "react";
import { Text } from "react-native";
import AppSafeArea from "@/components/AppSafeArea";

export default function AuthIndex() {

    return (
        <AppSafeArea flexDirection="column">
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>
                Login Page
            </Text>
        </AppSafeArea>
    );
}