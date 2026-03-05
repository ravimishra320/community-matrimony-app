import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RootNavigator from './src/navigation/RootNavigator';
import { useAuthStore } from './src/store/authStore';
import { cognitoService } from './src/services/cognito';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function App() {
  const { setUser, setAccessToken, setLoading } = useAuthStore();

  useEffect(() => {
    // Check for existing session on app load
    const checkSession = async () => {
      try {
        const session = await cognitoService.getCurrentSession();
        if (session) {
          const accessToken = session.getAccessToken().getJwtToken();
          setAccessToken(accessToken);
          
          // Fetch user data from API
          // const userData = await api.profile.getMe();
          // setUser(userData);
        }
      } catch (error) {
        console.log('No active session');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <RootNavigator />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
