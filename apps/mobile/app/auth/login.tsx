// filepath: c:\Users\USER\OneDrive\Dokumen\GitHub\messanger\apps\mobile\app\auth\index.tsx
import React, { useState } from "react";
import { Text, View } from "@/components/Themed";
import { Button, SafeAreaView } from "react-native";
import { postLogin } from "@/services/auth";
import { LoginResponse } from "@messanger/types";
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