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
    // Log the full URL and parameters for debugging
    console.log('Google auth callback received:', {
      hasCode: !!params.code,
      hasState: !!params.state,
      url: window?.location?.href,
      fullParams: params,
      isAuthenticated,
    });

    // Try to complete the auth session with improved error handling
    try {
      const result = WebBrowser.maybeCompleteAuthSession();
      console.log('maybeCompleteAuthSession result:', result);

      // Check for specific session completion scenarios
      if (result.type === 'failed') {
        console.warn('Auth session completion failed:', result);
      }
    } catch (error) {
      console.error('Error completing auth session:', error);

      // Try to recover if possible
      if (params.code && params.state) {
        console.log(
          'Despite error, code and state are present. Attempting to continue.'
        );
      }
    }

    // Wait a moment and then redirect the user with improved logic
    const redirectTimer = setTimeout(() => {
      if (isAuthenticated) {
        console.log('User is authenticated, redirecting to home');
        router.replace('/home');
      } else if (params.code && params.state) {
        console.log(
          'User has auth params but not authenticated yet, waiting a bit longer'
        );
        // If we have code and state but aren't authenticated, wait a bit longer
        setTimeout(() => {
          router.replace(isAuthenticated ? '/home' : '/');
        }, 2000);
      } else {
        console.log('No authentication detected, redirecting to login');
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
      {params.error && (
        <Text style={{ marginTop: 10, color: 'red' }}>
          {params.error}:{' '}
          {params.error_description || 'Authentication error occurred'}
        </Text>
      )}
    </View>
  );
}
