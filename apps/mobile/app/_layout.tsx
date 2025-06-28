import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Redirect, Stack, usePathname, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { use, useEffect } from 'react';
import 'react-native-reanimated';
import React from 'react';
import { useAuthStore } from '@/store/auth';
import AuthProvider from '@/providers/AuthProvider';
import { ActivityIndicator, Text, useColorScheme, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { rnNavigationTheme, rnPaperTheme } from '@/components/themes';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/services/queries';
import { WebSocketProvider } from '@/providers/WebSocketConnection';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'SFProText-Bold': require('../assets/fonts/SF-Pro-Text-Bold.otf'),
    'SFProText-Semibold': require('../assets/fonts/SF-Pro-Text-Semibold.otf'),
    'SFProText-Medium': require('../assets/fonts/SF-Pro-Text-Medium.otf'),
    'SFProText-Light': require('../assets/fonts/SF-Pro-Text-Light.otf'),
    'SFProText-Thin': require('../assets/fonts/SF-Pro-Text-Thin.otf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const route = useRouter();
  const pathName = usePathname();
  const colorScheme = useColorScheme();
  const { user, token, isLoading, setToken, setUser, setLoading } = useAuthStore();
  const paperTheme = rnPaperTheme[colorScheme ?? 'light'];
  const PUBLIC_ROUTES = ['/conversations', '/login', '/register', '/forgot-password'];

  if (isLoading) {
    return (
      <View
        style={{
          backgroundColor: 'rgba(255,255,255,0.6)',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}
      >
        <ActivityIndicator size="large" color="#075E54" />
      </View>
    );
  }
  React.useEffect(() => {
    if (!isLoading && (!token || token === '' || token == null) && !PUBLIC_ROUTES.includes(pathName)) {
      route.replace('/(auth)/login');
    }

    if (!isLoading && token && pathName === '/login') {
      route.replace('/conversations');
    }
  }, [isLoading, token, pathName, route]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={paperTheme}>
          <AuthProvider credentialsState={{ token, user, setUser, setToken, setLoading }}>
            <WebSocketProvider token={token} user={user!}>
              <Stack initialRouteName="(tabs)">
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
              </Stack>
            </WebSocketProvider>
          </AuthProvider>
        </PaperProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
