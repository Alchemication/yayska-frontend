import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import * as WebBrowser from 'expo-web-browser';
import { colors } from '../src/theme/colors';

/**
 * This component handles the generic OAuth callback.
 * It's a fallback handler that should only take action if not on the specific
 * Google callback route.
 */
export default function AuthCallback() {
  const params = useLocalSearchParams();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Check if we're on a specific auth callback route
    const isGoogleCallback = window.location.pathname.includes(
      '/auth/google/callback'
    );

    if (isGoogleCallback) {
      console.log(
        'On specific Google callback route, deferring to specialized handler'
      );
      return; // Let the specialized handler handle it
    }

    // Log parameters received in the URL
    console.log('Generic auth callback received params:', params);

    // Wait a moment and then redirect the user
    const redirectTimer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/home');
      } else {
        router.replace('/');
      }
    }, 2000);

    return () => clearTimeout(redirectTimer);
  }, [params, isAuthenticated]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background.primary,
      }}
    >
      <ActivityIndicator size="large" color={colors.primary.green} />
      <Text style={{ marginTop: 20, color: colors.text.primary }}>
        Completing authentication...
      </Text>
    </View>
  );
}
