import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
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
  const [stage, setStage] = useState('Initializing...');
  const [dots, setDots] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);

  // Create animated dots to show activity
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + '.' : ''));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Show elapsed time to give user a sense of progress
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Update progress stage based on elapsed time
    if (elapsedTime > 1) setStage('Verifying authentication...');
    if (elapsedTime > 4) setStage('Processing credentials...');
    if (elapsedTime > 7) setStage('Finalizing login...');
    if (elapsedTime > 12) setStage('Almost there...');
  }, [elapsedTime]);

  useEffect(() => {
    // Log the full URL and parameters for debugging
    console.log('Google auth callback received:', {
      hasCode: !!params.code,
      hasState: !!params.state,
      url: window?.location?.href,
      fullParams: params,
      isAuthenticated,
    });

    setStage('Receiving authentication response...');

    // Check if this is a Safari on macOS popup flow
    if (typeof window !== 'undefined' && window.opener && params.code) {
      try {
        setStage('Processing Safari auth flow...');
        // Send the auth code back to the opener window for Safari on macOS
        window.opener.postMessage(
          {
            type: 'auth_response',
            code: params.code,
            state: params.state,
          },
          window.location.origin
        );

        // Show success message and close popup after a delay
        document.body.innerHTML =
          '<html><body style="background-color: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; padding-top: 100px;"><h3>Authentication Successful!</h3><p>You can close this window and return to the app.</p></body></html>';

        setTimeout(() => {
          window.close();
        }, 2000);

        return;
      } catch (e) {
        console.error('Error posting message to opener:', e);
        setStage('Handling error in auth flow...');
      }
    }

    // Try to complete the auth session with improved error handling
    try {
      setStage('Completing authentication session...');
      const result = WebBrowser.maybeCompleteAuthSession();
      console.log('maybeCompleteAuthSession result:', result);

      // Check for specific session completion scenarios
      if (result.type === 'failed') {
        console.warn('Auth session completion failed:', result);
        setStage('Session completion issue - trying alternative approach...');
      }
    } catch (error) {
      console.error('Error completing auth session:', error);
      setStage('Handling authentication error...');

      // Try to recover if possible
      if (params.code && params.state) {
        console.log(
          'Despite error, code and state are present. Attempting to continue.'
        );
        setStage('Attempting recovery with auth code...');
      }
    }

    // Wait a moment and then redirect the user with improved logic
    const redirectTimer = setTimeout(() => {
      setStage('Finalizing user profile...');
      if (isAuthenticated) {
        console.log('User is authenticated, redirecting to home');
        setStage('Redirecting to home screen...');
        router.replace('/home');
      } else if (params.code && params.state) {
        console.log(
          'User has auth params but not authenticated yet, waiting a bit longer'
        );
        setStage('User profile not ready, waiting...');
        // If we have code and state but aren't authenticated, wait a bit longer
        setTimeout(() => {
          setStage('Completing redirect...');
          router.replace(isAuthenticated ? '/home' : '/');
        }, 2000);
      } else {
        console.log('No authentication detected, redirecting to login');
        setStage('Authentication not detected, returning to login...');
        router.replace('/');
      }
    }, 2000);

    return () => clearTimeout(redirectTimer);
  }, [params, isAuthenticated]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary.green} />

      <Text style={styles.statusText}>
        {stage}
        {dots}
      </Text>

      <Text style={styles.timeText}>Time elapsed: {elapsedTime}s</Text>

      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${Math.min(elapsedTime * 5, 90)}%` },
          ]}
        />
      </View>

      <Text style={styles.message}>Completing Google authentication</Text>

      <Text style={styles.subMessage}>
        Please wait while we securely sign you in
      </Text>

      {params.error && (
        <Text style={styles.errorText}>
          {params.error}:{' '}
          {params.error_description || 'Authentication error occurred'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    padding: 20,
  },
  statusText: {
    marginTop: 20,
    color: colors.text.primary,
    fontWeight: '500',
  },
  timeText: {
    marginTop: 8,
    color: colors.text.secondary,
    fontSize: 12,
  },
  progressContainer: {
    marginTop: 20,
    width: '80%',
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary.green,
  },
  message: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  subMessage: {
    marginTop: 8,
    color: colors.text.secondary,
    fontSize: 14,
  },
  errorText: {
    marginTop: 20,
    color: 'red',
    textAlign: 'center',
  },
});
