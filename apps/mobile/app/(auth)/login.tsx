import React, { useState } from "react";
import AppSafeArea from "@/components/AppSafeArea";
import { Stack, useRouter } from "expo-router";
import { Button, IconButton, Text } from "react-native-paper";
import AppTextInput from "@/components/AppTextInput";
import { loginSchema } from "@messanger/types";
import { postLogin } from "@/services/auth";
import StackWrapper from "@/components/StackWrapper";

export default function AuthIndex() {
    const router = useRouter();
    const pageState = useState({
        isLoading: false,
        showPassword: false,
        disableButtonSubmit: false,
        // username: {
        //     value: '',
        //     error: ''
        // },
        generalError: '',
        email: {
            value: 'test@mail.com',
            error: ''
        },
        password: {
            value: 'Barakadut123@',
            error: ''
        },
    });
    const handleLogin = async () => {
        const data = {
            email: pageState[0].email.value,
            password: pageState[0].password.value,
        };
        const validatedData = loginSchema.safeParse(data);
        pageState[1]({
            ...pageState[0],
            isLoading: true,
        });
        if (!validatedData.success) {
            const errors = validatedData.error.flatten().fieldErrors;
            pageState[1]({
                ...pageState[0],
                isLoading: false,
                email: {
                    ...pageState[0].email,
                    error: errors.email ? errors.email.join(', ') : ''
                },
                password: {
                    ...pageState[0].password,
                    error: errors.password ? errors.password.join(', ') : ''
                }
            });
            return;
        }
        try {
            const response = await postLogin(data);
            if (response.success) {
                // Handle successful login, e.g., navigate to the main app screen
                //router.push('/(tabs)');
            } else {
                pageState[1]({
                    ...pageState[0],
                    isLoading: false,
                    generalError: response.message || 'Login failed. Please try again.'
                });
            }
        } catch (error) {
            let errorMessage = 'An unexpected error occurred.';
            if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
                errorMessage = (error as any).message;
            }
            pageState[1]({
                ...pageState[0],
                isLoading: false,
                generalError: errorMessage
            });
        }
    };

    return (
        <AppSafeArea flexDirection="column" loading={pageState[0].isLoading} errorMessage={pageState[0].generalError}
            onDismissError={() => {
                pageState[1]({
                    ...pageState[0],
                    generalError: ''
                });
            }}>
            <Stack.Screen
                options={{
                    statusBarHidden: true,
                    title: "Login",
                    headerShown: true,
                    headerTitleAlign: "center",
                    headerTitleStyle: {
                        fontSize: 20,
                        fontWeight: "600",
                    },
                    headerRight: () => (
                        <Button
                            mode="text"
                            onPress={() => {
                                router.push('/(auth)/register');
                            }}
                        >
                            Register
                        </Button>
                    ),

                }}
            />
            <Text variant='titleSmall' style={{ textAlign: 'center', marginBottom: 16 }}>
                Fill in your credentials to login
            </Text>
            <AppTextInput
                label="Email"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                style={{ marginBottom: 16 }}
                value={pageState[0].email.value}
                onChangeText={(text) => {
                    pageState[1]({
                        ...pageState[0],
                        email: {
                            value: text,
                            error: ''
                        }
                    });
                    if (text.trim() === '') {
                        pageState[1]({
                            ...pageState[0],
                            disableButtonSubmit: true
                        });
                    }
                }}
                error={!!pageState[0].email.error}
                errorText={pageState[0].email.error || ''}
            />

            <StackWrapper flexDirection="column" alignItems="stretch" justifyContent="flex-start">

                <AppTextInput
                    label="Password"
                    placeholder="Enter your password"
                    secureTextEntry={!pageState[0].showPassword}
                    style={{ marginBottom: 16 }}
                    value={pageState[0].password.value}
                    onChangeText={(text) => {
                        pageState[1]({
                            ...pageState[0],
                            password: {
                                value: text,
                                error: ''
                            }
                        });
                        if (text.trim() === '') {
                            pageState[1]({
                                ...pageState[0],
                                disableButtonSubmit: true
                            });
                        }
                    }}
                    error={!!pageState[0].password.error}
                    errorText={pageState[0].password.error || ''}
                    suffix={
                        <IconButton
                            icon={pageState[0].showPassword ? "eye-off" : "eye"}
                            onPress={() => pageState[1]({
                                ...pageState[0],
                                showPassword: !pageState[0].showPassword
                            })}
                        />
                    }
                />
                <Button
                    mode="text"
                    onPress={() => {
                        router.push('/(auth)/forgot-password');
                    }}
                    style={{ marginBottom: 16, alignSelf: 'flex-end' }}
                >
                    Forgot Password?
                </Button>
            </StackWrapper>


            <Button
                mode="contained"
                onPress={handleLogin}
                disabled={pageState[0].disableButtonSubmit || pageState[0].isLoading}
                loading={pageState[0].isLoading}
                style={{ marginTop: 16 }}
            >
                Login
            </Button>
            {/* Todo: Remove This  */}
            <Button
                mode="outlined"
                onPress={() => {
                    router.push('/(tabs)/conversations');
                }}
                style={{ marginTop: 16 }}
            >
                Skip
            </Button>
        </AppSafeArea>
    );
}