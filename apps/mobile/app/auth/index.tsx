// filepath: c:\Users\USER\OneDrive\Dokumen\GitHub\messanger\apps\mobile\app\auth\index.tsx
import React, { useState } from "react";
import { Text, View } from "@/components/Themed";
import { Button } from "react-native";
import { postLogin } from "@/services/auth";
import { LoginResponse } from "@messanger/types";

export default function AuthIndex() {
    const [data, setData] = useState<LoginResponse | null>(null);
    return (
        <View>
            <Button title="Login" onPress={async () => {
                const response = await postLogin({
                    email: "test@mail.com",
                    password: "pAssword123@"
                });
                setData(response);
            }} />
            <Text>Auth Index</Text>
            <Text>{JSON.stringify(data)}</Text>
        </View>
    );
}