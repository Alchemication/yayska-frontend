import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Platform,
  StyleSheet,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';
import * as WebBrowser from 'expo-web-browser';
import { colors } from '../../../src/theme/colors';
import { Ionicons } from '@expo/vector-icons';

/**
 * This component handles the Google OAuth callback.
 * When users are redirected back from Google with an authorization code,
 * this page completes the auth session.
 */
export default function GoogleAuthCallback() {
  const params = useLocalSearchParams();
  const { isAuthenticated } = useAuth();
  const auth = useAuth();
  const [status, setStatus] = useState('Initializing...');
  const [progress, setProgress] = useState(10);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    // Create a progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 5;
        // Cap at 90% until we're actually done
        return Math.min(newProgress, 90);
      });
    }, 200);

    return () => clearInterval(progressInterval);
  }, []);

  useEffect(() => {
    // Log the parameters received in the URL
    console.log('[GoogleAuthCallback] Received params:', params);
    console.log('[GoogleAuthCallback] Authentication state:', {
      isAuthenticated,
      hasUser: !!auth.user,
      user: auth.user
        ? {
            id: auth.user.id,
            email: auth.user.email,
          }
        : null,
    });

    const handleCallback = async () => {
      // Prevent multiple processing
      if (isProcessingRef.current) {
        console.log(
          '[GoogleAuthCallback] Already processing, skipping duplicate call'
        );
        return;
      }

      isProcessingRef.current = true;

      // For web redirect flow, process the code
      if (Platform.OS === 'web' && params.code) {
        try {
          setStatus('Verifying authentication...');

          // Retrieve the stored code verifier and redirect URI
          const codeVerifier =
            sessionStorage.getItem('auth_code_verifier') || '';
          const redirectUri = sessionStorage.getItem('auth_redirect_uri') || '';

          if (!codeVerifier || !redirectUri) {
            console.error(
              '[GoogleAuthCallback] Missing code verifier or redirect URI'
            );
            setStatus('Authentication failed. Redirecting to login...');
            setTimeout(() => router.replace('/'), 2000);
            return;
          }

          // Call the processAuthResult method from AuthContext
          if (auth.processAuthResult) {
            setStatus('Processing credentials...');

            try {
              const success = await auth.processAuthResult(
                params.code as string,
                codeVerifier,
                redirectUri
              );

              // Complete the progress bar
              setProgress(100);

              if (success) {
                setStatus('Authentication successful! Redirecting...');
              } else {
                setStatus('Authentication failed. Please try again.');
                setTimeout(() => router.replace('/'), 2000);
              }
            } catch (error) {
              console.error(
                '[GoogleAuthCallback] Error during processAuthResult:',
                error
              );
              setStatus('Authentication error. Please try again.');
              setTimeout(() => router.replace('/'), 2000);
            }

            // Clean up storage
            sessionStorage.removeItem('auth_code_verifier');
            sessionStorage.removeItem('auth_redirect_uri');
          } else {
            console.error(
              '[GoogleAuthCallback] processAuthResult not available'
            );
            setStatus('Authentication error. Redirecting to login...');
            setTimeout(() => router.replace('/'), 2000);
          }
        } catch (error) {
          console.error('[GoogleAuthCallback] Error processing code:', error);
          setStatus('Authentication error. Please try again.');
          setTimeout(() => router.replace('/'), 2000);
        }
        return;
      }

      // For non-web platforms, try to complete the auth session
      try {
        setStatus('Completing authentication session...');
        const result = WebBrowser.maybeCompleteAuthSession();
        console.log(
          '[GoogleAuthCallback] maybeCompleteAuthSession result:',
          result
        );
      } catch (error) {
        console.error(
          '[GoogleAuthCallback] Error completing auth session:',
          error
        );
        setStatus('Authentication error. Please try again.');
      }

      // Wait a moment and then redirect the user based on auth state
      const redirectTimer = setTimeout(() => {
        if (isAuthenticated) {
          setStatus('Authentication successful! Redirecting...');
          setProgress(100);
          router.replace('/home');
        } else {
          // If not authenticated yet, wait a bit more since auth might still be in progress
          setStatus('Waiting for authentication to complete...');
          const extendedTimer = setTimeout(() => {
            if (isAuthenticated) {
              setStatus('Authentication successful! Redirecting...');
              setProgress(100);
              router.replace('/home');
            } else {
              setStatus('Authentication timeout. Redirecting to login...');
              router.replace('/');
            }
          }, 3000);

          return () => clearTimeout(extendedTimer);
        }
      }, 2000);

      return () => clearTimeout(redirectTimer);
    };

    handleCallback();
  }, [params, isAuthenticated, auth]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* App Logo */}
        <View style={styles.logoContainer}>
          <Ionicons
            name="checkmark-circle"
            size={56}
            color={colors.primary.green}
          />
        </View>

        <Text style={styles.title}>Google Sign-In</Text>

        {/* Status message */}
        <Text style={styles.status}>{status}</Text>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${progress}%` },
              progress === 100 ? styles.progressComplete : null,
            ]}
          />
        </View>

        {/* Loading spinner */}
        <ActivityIndicator
          size="large"
          color={colors.primary.green}
          style={styles.spinner}
        />

        <Text style={styles.info}>
          Please wait while we complete your authentication.
        </Text>
      </View>
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
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 30,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logoContainer: {
    marginBottom: 20,
    backgroundColor: colors.background.primary,
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
    marginBottom: 24,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary.green,
    borderRadius: 4,
  },
  progressComplete: {
    backgroundColor: '#4CAF50',
  },
  spinner: {
    marginBottom: 16,
  },
  info: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
