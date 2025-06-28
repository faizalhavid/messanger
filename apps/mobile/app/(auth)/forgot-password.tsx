import AppSafeArea from '@/components/AppSafeArea';
import AppTextInput from '@/components/AppTextInput';
import { postForgotPassword } from '@/services/apis/auth';
import { changePasswordSchema } from '@messanger/types';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Button, IconButton, Text } from 'react-native-paper';

export default function ForgotPassword() {
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
      error: '',
    },
    password: {
      value: 'Barakadut123@',
      error: '',
    },
  });

  const handleForgotPassword = async () => {
    const data = {
      email: pageState[0].email.value,
    };
    const validatedData = changePasswordSchema.safeParse(data);
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
          error: errors.email ? errors.email.join(', ') : '',
        },
      });
      return;
    }
    try {
      const response = await postForgotPassword(data.email);
      if (response.success) {
        // Handle successful password reset, e.g., navigate to a confirmation screen
        router.push({
          pathname: '/(auth)/verification',
          params: { email: data.email },
        });
      } else {
        pageState[1]({
          ...pageState[0],
          isLoading: false,
          generalError: typeof response.error === 'string' ? response.error : response.error?.message || 'Failed to reset password',
        });
      }
    } catch (error: any) {
      pageState[1]({
        ...pageState[0],
        isLoading: false,
        generalError: error?.message || 'An unexpected error occurred.',
      });
    }
    return (
      <AppSafeArea flexDirection="column" loading={pageState[0].isLoading} style={{ padding: 20 }} errorMessage={pageState[0].generalError} onDismissError={() => pageState[1]({ ...pageState[0], generalError: '' })}>
        <Stack.Screen
          options={{
            statusBarHidden: true,
            title: 'Forgot Password',
            headerShown: true,
            headerTitleAlign: 'center',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: '600',
            },
            // headerRight: () => (
            //     <Button
            //         mode="text"
            //         onPress={() => {
            //             router.push('/(auth)/register');
            //         }}
            //     >
            //         Register
            //     </Button>
            // ),
          }}
        />
        <Text variant="titleSmall" style={{ textAlign: 'center', marginBottom: 16 }}>
          Please enter your email to reset your password
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
                error: '',
              },
            });
            if (text.trim() === '') {
              pageState[1]({
                ...pageState[0],
                disableButtonSubmit: true,
              });
            }
          }}
          error={!!pageState[0].email.error}
          errorText={pageState[0].email.error || ''}
        />
        <Button mode="contained" onPress={handleForgotPassword} disabled={pageState[0].disableButtonSubmit}>
          Submit
        </Button>
      </AppSafeArea>
    );
  };
}
