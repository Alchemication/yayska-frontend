import React, { createContext, useState, useContext, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { jwtDecode } from 'jwt-decode';
import Constants from 'expo-constants';
import { ENV } from '../utils/environment';
import { trackEvent } from '../utils/analytics';
import { authApi } from '../services/authApi';
import { Alert } from 'react-native';
import { User } from '../types/user';

// Register for redirect
WebBrowser.maybeCompleteAuthSession();

// Storage keys
const AUTH_KEYS = {
  ACCESS_TOKEN: 'yayska_access_token',
  REFRESH_TOKEN: 'yayska_refresh_token',
  USER_INFO: 'yayska_user_info',
};

// The AuthContext interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  processAuthResult?: (
    code: string,
    codeVerifier: string,
    redirectUri: string
  ) => Promise<boolean>;
  setUser: (user: User | null) => void; // Expose setUser
}

// Create context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  setUser: () => {}, // Add default for setUser
});

// API base URL from environment variables
const API_BASE_URL = ENV.API_URL;

// Google auth configuration
const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load the user data on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check if we have a token in storage
        const token = await AsyncStorage.getItem(AUTH_KEYS.ACCESS_TOKEN);

        if (!token) {
          console.log('[AuthContext] No token found, user is logged out.');
          setIsLoading(false);
          return;
        }

        console.log('[AuthContext] Token found, verifying with server...');
        // With a token, always fetch the latest user profile to ensure data is fresh
        // and the token is still valid.
        const userProfile = await authApi.getUserProfile();

        if (userProfile) {
          console.log('[AuthContext] User verified, setting auth state.');
          // Save the fresh user data to storage
          await AsyncStorage.setItem(
            AUTH_KEYS.USER_INFO,
            JSON.stringify(userProfile)
          );
          setUser(userProfile);
          setIsAuthenticated(true);
        } else {
          // This case should ideally not be hit if authApi.getUserProfile throws on error
          console.warn(
            '[AuthContext] Token was present but failed to fetch user profile.'
          );
          await clearAuthData();
        }
      } catch (error) {
        console.error('[AuthContext] Failed to verify token/load user:', error);
        // If fetching the profile fails (e.g., 401), treat as logged out
        await clearAuthData();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async () => {
    try {
      setIsLoading(true);
      console.log('[AuthContext] Starting login process');

      // Track login attempt
      await trackEvent('LOGIN_ATTEMPT', {
        method: 'google',
        platform: Platform.OS,
      });

      // Get the client ID for the current platform
      const clientId = Platform.select({
        web: ENV.GOOGLE_WEB_CLIENT_ID,
        ios: ENV.GOOGLE_IOS_CLIENT_ID,
        android: ENV.GOOGLE_ANDROID_CLIENT_ID,
      });

      if (!clientId) {
        console.error('No client ID found for current platform');
        setIsLoading(false);
        return;
      }

      // Generate an appropriate redirect URI
      let redirectUri;
      if (Platform.OS === 'web') {
        redirectUri = `${window.location.origin}/auth/google/callback`;
      } else {
        // For native platforms, use the Expo-provided redirect URI
        redirectUri = AuthSession.makeRedirectUri({
          scheme: 'yayska',
          path: 'auth/google/callback',
        });
      }

      console.log('[AuthContext] Using redirect URI:', redirectUri);

      // Create the auth request
      const authRequest = new AuthSession.AuthRequest({
        responseType: AuthSession.ResponseType.Code,
        clientId,
        redirectUri,
        usePKCE: true,
        scopes: ['profile', 'email'],
        extraParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      });

      // For web, use a redirect-based flow to avoid popup blockers
      if (Platform.OS === 'web') {
        // Generate the auth URL for direct navigation
        const authUrl = await authRequest.makeAuthUrlAsync(discovery);
        console.log('[AuthContext] Redirecting to auth URL');

        // Store the code verifier in sessionStorage so we can retrieve it after redirect
        sessionStorage.setItem(
          'auth_code_verifier',
          authRequest.codeVerifier || ''
        );
        sessionStorage.setItem('auth_redirect_uri', redirectUri);

        // Redirect the whole page to the auth URL
        window.location.href = authUrl;
        return; // Exit early as we're doing a full page redirect
      }

      // For native platforms, use the standard flow
      const result = await authRequest.promptAsync(discovery);
      console.log('[AuthContext] Auth request result type:', result.type);

      // Handle the result
      if (result.type === 'success') {
        // Process the auth result and exchange code for tokens
        await processAuthResult(
          result.params.code,
          authRequest.codeVerifier || '',
          redirectUri
        );
      } else if (result.type === 'error') {
        console.error('[AuthContext] Auth error:', result.error);
      }
    } catch (error) {
      console.error('[AuthContext] Login error:', error);

      // Track login failure
      await trackEvent('LOGIN_FAILED', {
        method: 'google',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Process the auth result (code exchange) - used by both direct login and callback
  const processAuthResult = async (
    code: string,
    codeVerifier: string,
    redirectUri: string
  ): Promise<boolean> => {
    try {
      console.log('[AuthContext] Processing auth result:', {
        hasCode: !!code,
        hasCodeVerifier: !!codeVerifier,
        redirectUri,
      });

      // Exchange code for tokens using the backend
      const tokenResponse = await fetch(
        `${API_BASE_URL}/auth/google/callback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            code_verifier: codeVerifier,
            redirect_uri: redirectUri,
          }),
          credentials: 'include',
          // Add mode to handle CORS errors more gracefully
          mode: 'cors',
        }
      );

      if (!tokenResponse.ok) {
        console.error('[AuthContext] Token exchange failed:', {
          status: tokenResponse.status,
          statusText: tokenResponse.statusText,
        });

        // If we got a valid response but not OK, try to parse error details
        try {
          const errorData = await tokenResponse.json();
          console.error('[AuthContext] Error details:', errorData);
        } catch (e) {
          // Ignore json parsing errors
        }

        throw new Error(
          `Failed to exchange code for tokens: ${tokenResponse.status} ${tokenResponse.statusText}`
        );
      }

      const tokenData = await tokenResponse.json();
      console.log('[AuthContext] Token exchange successful');

      // Save the tokens in storage
      await AsyncStorage.setItem(
        AUTH_KEYS.ACCESS_TOKEN,
        tokenData.access_token
      );
      await AsyncStorage.setItem(
        AUTH_KEYS.REFRESH_TOKEN,
        tokenData.refresh_token
      );
      await AsyncStorage.setItem(
        AUTH_KEYS.USER_INFO,
        JSON.stringify(tokenData.user)
      );

      // Update state with user data
      setUser(tokenData.user);
      setIsAuthenticated(true);

      // --- NEW SAFEGUARD ---
      // Before proceeding, verify the user record was actually created in the database.
      try {
        console.log('[AuthContext] Verifying user creation with self-check...');
        const verifiedUserProfile = await authApi.getUserProfile();
        console.log('[AuthContext] Self-check successful. User exists in DB.');

        // Now, use this verified profile as the source of truth
        setUser(verifiedUserProfile);
        await AsyncStorage.setItem(
          AUTH_KEYS.USER_INFO,
          JSON.stringify(verifiedUserProfile)
        );
        setIsAuthenticated(true);
      } catch (selfCheckError) {
        console.error(
          '[AuthContext] Self-check failed! The user record was not found in the DB after a successful login callback. This is a critical backend issue.',
          selfCheckError
        );
        // Invalidate this failed login session
        await logout();
        Alert.alert(
          'Account Creation Error',
          'Your account could not be created at this time. Please try signing in again.'
        );
        return false; // Stop the login process
      }
      // --- END SAFEGUARD ---

      // Track successful login
      await trackEvent('USER_LOGIN', {
        method: 'google',
        is_new_user: tokenData.is_new_user,
        platform: Platform.OS,
      });

      // Track registration for new users
      if (tokenData.is_new_user) {
        await trackEvent('USER_REGISTRATION', {
          method: 'google',
          platform: Platform.OS,
        });
      }

      // If this was the first login, redirect to onboarding
      if (tokenData.is_new_user) {
        router.replace('/onboarding');
      } else {
        router.replace('/home');
      }

      return true;
    } catch (error) {
      console.error('[AuthContext] Failed to process auth result:', error);

      // Track authentication failure
      await trackEvent('AUTHENTICATION_FAILED', {
        method: 'google',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Check if already authenticated despite the error
      const accessToken = await AsyncStorage.getItem(AUTH_KEYS.ACCESS_TOKEN);
      const userInfo = await AsyncStorage.getItem(AUTH_KEYS.USER_INFO);

      if (accessToken && userInfo) {
        console.log(
          '[AuthContext] Found existing credentials despite fetch error'
        );
        try {
          const userData = JSON.parse(userInfo);
          setUser(userData);
          setIsAuthenticated(true);
          router.replace('/home');
          return true;
        } catch (e) {
          console.error('[AuthContext] Error parsing user info:', e);
        }
      }

      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);

      // Track logout
      await trackEvent('USER_LOGOUT', {
        method: 'manual',
        platform: Platform.OS,
      });

      // Clear tokens from storage
      await AsyncStorage.removeItem(AUTH_KEYS.ACCESS_TOKEN);
      await AsyncStorage.removeItem(AUTH_KEYS.REFRESH_TOKEN);

      // Reset state
      setUser(null);
      setIsAuthenticated(false);

      // Navigate to login screen
      router.replace('/');
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to clear all auth-related data
  const clearAuthData = async () => {
    await AsyncStorage.removeItem(AUTH_KEYS.ACCESS_TOKEN);
    await AsyncStorage.removeItem(AUTH_KEYS.REFRESH_TOKEN);
    await AsyncStorage.removeItem(AUTH_KEYS.USER_INFO);
  };

  // Return the provider
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        processAuthResult,
        setUser, // Provide setUser through context
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
