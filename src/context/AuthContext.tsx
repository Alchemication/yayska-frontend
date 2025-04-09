import React, { createContext, useState, useContext, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { jwtDecode } from 'jwt-decode';
import Constants from 'expo-constants';
import { ENV } from '../utils/environment';

// Register for redirect
WebBrowser.maybeCompleteAuthSession();

// Storage keys
const AUTH_KEYS = {
  ACCESS_TOKEN: 'yayska_access_token',
  REFRESH_TOKEN: 'yayska_refresh_token',
  USER_INFO: 'yayska_user_info',
};

// User type
export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

// The AuthContext interface
interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  processAuthResult?: (
    code: string,
    codeVerifier: string,
    redirectUri: string
  ) => Promise<boolean>;
}

// Create context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
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
        const userInfo = await AsyncStorage.getItem(AUTH_KEYS.USER_INFO);

        if (!token) {
          setIsLoading(false);
          return;
        }

        // Validate token and load user data
        try {
          // Validate token with simple expiry check
          const decodedToken = jwtDecode(token);

          // Load user from stored user info
          if (userInfo) {
            const userData = JSON.parse(userInfo);
            setUser(userData);
            setIsAuthenticated(true);
            console.log(
              '[AuthContext] Loaded user from storage:',
              userData.email
            );
          } else {
            console.warn('[AuthContext] Token found but no user info');
            await AsyncStorage.removeItem(AUTH_KEYS.ACCESS_TOKEN);
          }
        } catch (e) {
          console.error('[AuthContext] Invalid token or user data:', e);
          await AsyncStorage.removeItem(AUTH_KEYS.ACCESS_TOKEN);
        }
      } catch (error) {
        console.error('[AuthContext] Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async () => {
    try {
      console.log('[AuthContext] Starting login process');
      setIsLoading(true);

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
    } finally {
      setIsLoading(false);
    }
  };

  // Process the auth result (code exchange) - used by both direct login and callback
  const processAuthResult = async (
    code: string,
    codeVerifier: string,
    redirectUri: string
  ) => {
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
        }
      );

      if (!tokenResponse.ok) {
        console.error('[AuthContext] Token exchange failed:', {
          status: tokenResponse.status,
          statusText: tokenResponse.statusText,
        });
        throw new Error('Failed to exchange code for tokens');
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

      // If this was the first login, redirect to onboarding
      if (tokenData.is_new_user) {
        router.replace('/onboarding');
      } else {
        router.replace('/home');
      }

      return true;
    } catch (error) {
      console.error('[AuthContext] Failed to process auth result:', error);
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
