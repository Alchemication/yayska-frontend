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

// Context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

// API base URL from environment variables
const API_BASE_URL = ENV.API_URL;

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on app load
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check for existing tokens
        const accessToken = await AsyncStorage.getItem(AUTH_KEYS.ACCESS_TOKEN);
        const userInfo = await AsyncStorage.getItem(AUTH_KEYS.USER_INFO);

        if (accessToken && userInfo) {
          // Validate token (simple expiry check)
          try {
            const decoded: any = jwtDecode(accessToken);
            const currentTime = Date.now() / 1000;

            if (decoded.exp > currentTime) {
              // Token still valid
              setUser(JSON.parse(userInfo));
            } else {
              // Token expired, try to refresh
              const success = await refreshToken();
              if (!success) {
                await clearAuthData();
              }
            }
          } catch (error) {
            // Invalid token
            await clearAuthData();
          }
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Function to clear auth data
  const clearAuthData = async () => {
    console.log('Clearing all auth data from storage');

    try {
      // Remove all auth-related items from AsyncStorage
      await AsyncStorage.multiRemove([
        AUTH_KEYS.ACCESS_TOKEN,
        AUTH_KEYS.REFRESH_TOKEN,
        AUTH_KEYS.USER_INFO,
      ]);

      // Clear user state
      setUser(null);

      console.log('Auth data cleared successfully');
      return true;
    } catch (error) {
      console.error('Error clearing auth data:', error);

      // Try individual removals if multiRemove fails
      try {
        console.log('Trying individual key removal as fallback');
        await AsyncStorage.removeItem(AUTH_KEYS.ACCESS_TOKEN);
        await AsyncStorage.removeItem(AUTH_KEYS.REFRESH_TOKEN);
        await AsyncStorage.removeItem(AUTH_KEYS.USER_INFO);
        setUser(null);
        console.log('Individual auth data items cleared');
        return true;
      } catch (fallbackError) {
        console.error('Failed even with fallback clearing:', fallbackError);
        return false;
      }
    }
  };

  // Function to refresh token
  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = await AsyncStorage.getItem(AUTH_KEYS.REFRESH_TOKEN);
      if (!refreshToken) return false;

      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
        credentials: 'include',
      });

      if (!response.ok) return false;

      const data = await response.json();
      await AsyncStorage.setItem(AUTH_KEYS.ACCESS_TOKEN, data.access_token);
      if (data.refresh_token) {
        await AsyncStorage.setItem(AUTH_KEYS.REFRESH_TOKEN, data.refresh_token);
      }

      // If user info was updated, update that too
      if (data.user) {
        await AsyncStorage.setItem(
          AUTH_KEYS.USER_INFO,
          JSON.stringify(data.user)
        );
        setUser(data.user);
      } else {
        // Reload existing user info
        const userInfo = await AsyncStorage.getItem(AUTH_KEYS.USER_INFO);
        if (userInfo) {
          setUser(JSON.parse(userInfo));
        }
      }

      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  };

  // Login function
  const login = async () => {
    try {
      // Generate redirect URI with special handling for web production
      let redirectUri;
      if (Platform.OS === 'web') {
        // In web, we need to ensure the redirect URI matches what we've configured in Google console
        // and in vercel.json
        const host = window.location.origin;
        redirectUri = `${host}/auth/google/callback`;
        console.log('Using web redirect URI:', redirectUri);
      } else {
        // For native platforms, use the Expo-provided redirect URI
        redirectUri = AuthSession.makeRedirectUri({
          scheme: 'yayska',
          path: 'auth/google/callback',
        });
        console.log('Using native redirect URI:', redirectUri);
      }

      // Get the client ID from our environment utility based on platform
      const clientId = Platform.select({
        web: ENV.GOOGLE_WEB_CLIENT_ID,
        ios: ENV.GOOGLE_IOS_CLIENT_ID,
        android: ENV.GOOGLE_ANDROID_CLIENT_ID,
      });

      if (!clientId) {
        console.error('No client ID found for current platform');
        return;
      }

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

      const result = await authRequest.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      });

      console.log('Auth request result type:', result.type);

      // Only log detailed properties if the result is successful
      if (result.type === 'success') {
        const successResult = result as AuthSession.AuthSessionResult & {
          params: { code: string; [key: string]: string };
          url: string;
        };

        console.log('Auth request successful:', {
          hasCode: !!successResult.params?.code,
          url: successResult.url,
        });
      } else if ('error' in result) {
        // Handle error case if the object has an error property
        console.log('Auth request error:', (result as any).error);
      }

      if (result.type === 'success') {
        // Cast to access the params property safely
        const successResult = result as AuthSession.AuthSessionResult & {
          params: { code: string; [key: string]: string };
        };

        // Exchange code for tokens using your backend
        const { code } = successResult.params;

        // Get the codeVerifier that was automatically generated
        const codeVerifier = authRequest.codeVerifier;

        console.log('Sending token exchange request to API:', {
          endpoint: `${API_BASE_URL}/auth/google/callback`,
          hasCode: !!code,
          hasCodeVerifier: !!codeVerifier,
          redirectUri,
        });

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
          console.error('Token exchange failed:', {
            status: tokenResponse.status,
            statusText: tokenResponse.statusText,
          });

          try {
            const errorBody = await tokenResponse.text();
            console.error('Error response:', errorBody);
          } catch (e) {
            console.error('Could not parse error response');
          }

          throw new Error('Failed to exchange code for tokens');
        }

        const tokenData = await tokenResponse.json();

        // Log token data to debug
        console.log('Auth response received:', {
          hasAccessToken: !!tokenData.access_token,
          hasRefreshToken: !!tokenData.refresh_token,
          user: tokenData.user
            ? {
                id: tokenData.user.id,
                name: tokenData.user.name,
                email: tokenData.user.email,
                hasPicture: !!tokenData.user.picture,
                pictureUrl: tokenData.user.picture,
              }
            : 'No user data',
        });

        // Ensure we have a valid user object with a picture field
        let userData = tokenData.user;

        // If we have user data but no picture field, check for alternative fields
        if (userData && !userData.picture) {
          // Check for various possible picture field names
          if (userData.photoUrl) userData.picture = userData.photoUrl;
          else if (userData.photo_url) userData.picture = userData.photo_url;
          else if (userData.image) userData.picture = userData.image;
          else if (userData.avatar) userData.picture = userData.avatar;
          else if (userData.profilePhoto)
            userData.picture = userData.profilePhoto;

          console.log(
            'Updated user with picture field:',
            userData.picture
              ? 'Picture found as: ' + userData.picture
              : 'No picture field found'
          );
        }

        // Store tokens and user info
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
          JSON.stringify(userData)
        );

        setUser(userData);

        // If this was the first login, redirect to onboarding
        if (tokenData.is_new_user) {
          router.replace('/onboarding');
        } else {
          router.replace('/home');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log('Starting logout process...');

      // Call backend logout endpoint
      const accessToken = await AsyncStorage.getItem(AUTH_KEYS.ACCESS_TOKEN);
      if (accessToken) {
        console.log('Access token found, calling backend logout endpoint');
        try {
          const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            console.log('Backend logout successful');
          } else {
            console.warn('Backend logout failed with status:', response.status);
            // Continue with local logout even if backend logout fails
          }
        } catch (apiError) {
          console.error('Backend logout API error:', apiError);
          // Continue with local logout even if backend call fails
        }
      } else {
        console.log('No access token found, skipping backend logout call');
      }

      // Clear auth data from storage
      console.log('Clearing local auth data...');
      await clearAuthData();

      // Explicitly set user to null to ensure UI updates
      setUser(null);

      console.log('Logout complete, redirecting to welcome screen');

      // Force a complete navigation reset to the welcome screen
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);

      // Even if there's an error, try to clear data and redirect
      try {
        await AsyncStorage.multiRemove([
          AUTH_KEYS.ACCESS_TOKEN,
          AUTH_KEYS.REFRESH_TOKEN,
          AUTH_KEYS.USER_INFO,
        ]);
        setUser(null);
        router.replace('/');
      } catch (finalError) {
        console.error(
          'Failed to perform emergency cleanup during logout:',
          finalError
        );
        // At this point, we've tried everything we can
        alert('Logout failed. Please restart the app.');
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
