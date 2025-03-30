import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';
import * as WebBrowser from 'expo-web-browser';
import { colors } from '../../../src/theme/colors';

/**
 * This component handles the Google OAuth callback.
 * When users are redirected back from Google with an authorization code,
 * this page displays while the auth session is being completed.
 */
export default function GoogleAuthCallback() {
  const params = useLocalSearchParams();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    console.log('Google auth callback received:', {
      hasCode: !!params.code,
      hasState: !!params.state,
      url: window?.location?.href,
    });

    // Try to complete the auth session
    try {
      const result = WebBrowser.maybeCompleteAuthSession();
      console.log('maybeCompleteAuthSession result:', result);
    } catch (error) {
      console.error('Error completing auth session:', error);
    }

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
        Completing Google authentication...
      </Text>
    </View>
  );
}
