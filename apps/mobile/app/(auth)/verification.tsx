

import AppSafeArea from '@/components/AppSafeArea';
import AppTextInput from '@/components/AppTextInput';
import { postVerification } from '@/services/auth';
import { validateChangePassword } from '@messanger/types';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react'

export default function Verifications() {
    const params = useLocalSearchParams();
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
        token: {
            value: 'Barakadut123@',
            error: ''
        },
    });
    const handleVerification = async () => {
        const data = {
            email: params.email as string,
            token: pageState[0].token.value
        }
        const validatedData = validateChangePassword.safeParse(data);

        pageState[1]({
            ...pageState[0],
            isLoading: true,
        });
        if (!validatedData.success) {
            const errors = validatedData.error.flatten().fieldErrors;
            pageState[1]({
                ...pageState[0],
                isLoading: false,
                token: {
                    ...pageState[0].token,
                    error: errors.token ? errors.token.join(', ') : ''
                }
            });
            return;
        }
        try {
            const response = await postVerification(data);
            if (response.success) {
                // Handle successful verification, e.g., navigate to the main app screen
                router.push('/(tabs)');
            } else {
                pageState[1]({
                    ...pageState[0],
                    isLoading: false,
                    generalError: typeof response.error === 'string'
                        ? response.error
                        : response.error?.message || 'Verification failed. Please try again.'
                });
            }
        } catch (error: any) {
            pageState[1]({
                ...pageState[0],
                isLoading: false,
                generalError: error?.message || 'An unexpected error occurred.'
            });
        }
    }
    return (
        <AppSafeArea flexDirection='column' loading={pageState[0].isLoading} style={{ padding: 20 }} errorMessage={pageState[0].generalError} onDismissError={() => pageState[1]({ ...pageState[0], generalError: '' })}>
            <Stack.Screen
                options={{
                    statusBarHidden: true,
                    title: "Verifications",
                    headerShown: true,
                    headerTitleAlign: "center",
                    headerTitleStyle: {
                        fontSize: 20,
                        fontWeight: "600",
                    },
                }}
            />
            <AppTextInput
                label="Verification Token"
                placeholder="Enter your verification token"
                keyboardType="default"
                autoCapitalize="none"
                style={{ marginBottom: 16 }}
                value={pageState[0].token.value}
                onChangeText={(text) => {
                    pageState[1]({
                        ...pageState[0],
                        token: {
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
                error={!!pageState[0].token.error}
                errorText={pageState[0].token.error || ''}
            />
        </AppSafeArea>
    )
}
