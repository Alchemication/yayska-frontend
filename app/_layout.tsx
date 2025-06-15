// app/_layout.tsx
import { Stack } from 'expo-router';
import { colors } from '../src/theme/colors';
import { AuthProvider } from '../src/context/AuthContext';
import { Image } from 'react-native';
import { useEffect } from 'react';
import { initializeAnalytics } from '../src/utils/analytics';

export default function RootLayout() {
  useEffect(() => {
    // Initialize analytics system
    const cleanup = initializeAnalytics();

    // Cleanup on unmount
    return cleanup;
  }, []);

  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background.primary,
          },
          headerTintColor: colors.primary.green,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="onboarding"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="home"
          options={{
            headerShown: false,
            headerBackVisible: false, // Prevent going back to onboarding
          }}
        />
        <Stack.Screen
          name="explore"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="concept/[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="manage-children"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
