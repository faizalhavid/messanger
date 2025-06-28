import { Stack, useNavigation, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Button, IconButton, Text } from 'react-native-paper';
import AppSafeArea from '@/components/AppSafeArea';
import AppTextInput from '@/components/AppTextInput';
import { BaseApiResponse, RegisterResponse, registerSchema } from '@messanger/types';
import { postRegister } from '@/services/apis/auth';

export default function Register() {
  const pageState = useState({
    isLoading: false,
    showPassword: false,
    disableButtonSubmit: false,
    showConfirmPassword: false,
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
    confirmPassword: {
      value: 'Barakadut123@',
      error: '',
    },
  });
  const router = useRouter();
  const handleRegister = async () => {
    const data = {
      // username: pageState[0].username.value,
      email: pageState[0].email.value,
      password: pageState[0].password.value,
      confirmPassword: pageState[0].confirmPassword.value,
    };
    const validatedData = registerSchema.safeParse(data);
    pageState[1]({
      ...pageState[0],
      isLoading: true,
    });
    if (!validatedData.success) {
      const errors = validatedData.error.flatten().fieldErrors;
      pageState[1]({
        ...pageState[0],
        isLoading: false,
        // username: {
        //     ...pageState[0].username,
        //     error: errors.username ? errors.username.join(', ') : ''
        // },
        email: {
          ...pageState[0].email,
          error: errors.email ? errors.email.join(', ') : '',
        },
        password: {
          ...pageState[0].password,
          error: errors.password ? errors.password.join(', ') : '',
        },
        confirmPassword: {
          ...pageState[0].confirmPassword,
          error: errors.confirmPassword ? errors.confirmPassword.join(', ') : '',
        },
      });

      console.error('Validation failed:', validatedData.error);
      return;
    } else {
      postRegister({
        username: validatedData.data.username!,
        email: validatedData.data.email!,
        password: validatedData.data.password!,
      })
        .then((response: BaseApiResponse<RegisterResponse>) => {
          if (response.success) {
            // Handle successful registration, e.g., navigate to login or home screen
            console.log('Registration successful:', response.data);
          } else {
            // Handle registration error
            console.error('Registration failed:', response.message);
            pageState[1]({
              ...pageState[0],
              generalError: typeof response.error === 'string' ? response.error : response.error?.message || 'Registration failed',
            });
          }
        })
        .catch((error) => {
          pageState[0].isLoading = false;
          console.error('Error during registration:', error);
        });
    }
  };
  return (
    <AppSafeArea loading={pageState[0].isLoading} errorMessage={pageState[0].generalError} onDismissError={() => pageState[1]({ ...pageState[0], generalError: '' })}>
      <Stack.Screen
        options={{
          statusBarHidden: true,
          title: 'Create an account',
          headerShown: true,
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: '600',
          },
          headerLeft: () => (
            <Button mode="text" onPress={() => router.push('/(auth)/login')}>
              Login
            </Button>
          ),

          headerRight: () => (
            <Button mode="text" onPress={handleRegister} disabled={pageState[0].disableButtonSubmit}>
              Done
            </Button>
          ),
        }}
      />
      <Text variant="titleSmall" style={{ textAlign: 'center', marginBottom: 16 }}>
        Please fill in the details to create your account
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
        error={!!pageState[0].password.error}
        errorText={pageState[0].password.error || ''}
        suffix={
          <IconButton
            icon={pageState[0].showPassword ? 'eye-off' : 'eye'}
            onPress={() =>
              pageState[1]({
                ...pageState[0],
                showPassword: !pageState[0].showPassword,
              })
            }
          />
        }
      />
      <AppTextInput
        label="Confirm Password"
        placeholder="Enter your password again"
        secureTextEntry={!pageState[0].showConfirmPassword}
        style={{ marginBottom: 16 }}
        value={pageState[0].confirmPassword.value}
        onChangeText={(text) => {
          pageState[1]({
            ...pageState[0],
            confirmPassword: {
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
        error={!!pageState[0].confirmPassword.error}
        errorText={pageState[0].confirmPassword.error || ''}
        suffix={
          <IconButton
            icon={pageState[0].showConfirmPassword ? 'eye-off' : 'eye'}
            onPress={() =>
              pageState[1]({
                ...pageState[0],
                showConfirmPassword: !pageState[0].showConfirmPassword,
              })
            }
          />
        }
      />
    </AppSafeArea>
  );
}
