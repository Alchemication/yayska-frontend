import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import * as WebBrowser from 'expo-web-browser';
import { colors } from '../src/theme/colors';

/**
 * This component handles the OAuth callback.
 * When users are redirected back from Google with an authorization code,
 * this page will automatically handle the redirect and complete the auth flow.
 */
export default function AuthCallback() {
  const params = useLocalSearchParams();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Log parameters received in the URL
    console.log('Auth callback received params:', params);

    // This component doesn't need to do anything special since
    // WebBrowser.maybeCompleteAuthSession() handles the redirect
    // in the AuthContext componentt

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
