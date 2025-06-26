import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../context/AuthContext';
import Constants from 'expo-constants';

// Storage keys
const AUTH_KEYS = {
  ACCESS_TOKEN: 'yayska_access_token',
  REFRESH_TOKEN: 'yayska_refresh_token',
  USER_INFO: 'yayska_user_info',
};

// Get environment variable helper
const getEnvVariable = (key: string, defaultValue: string = ''): string => {
  return (Constants.expoConfig?.extra as any)?.[key] || defaultValue;
};

// API base URL from environment variables with fallbacks
const API_BASE_URL = getEnvVariable(
  'API_URL',
  process.env.NODE_ENV === 'production'
    ? 'https://yayska-backend.vercel.app/api/v1'
    : 'http://localhost:8000/api/v1'
);

// Error class for auth-related errors
class AuthApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data: any = null) {
    super(message);
    this.name = 'AuthApiError';
    this.status = status;
    this.data = data;
  }
}

// Get the current access token
export const getAccessToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem(AUTH_KEYS.ACCESS_TOKEN);
};

// Generic fetch with auth handling
export const fetchWithAuth = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    // Get the access token
    const accessToken = await getAccessToken();
    console.log('Access token exists:', !!accessToken);

    // Add auth header if token exists
    const headers = {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...options.headers,
    };

    console.log('Making request to:', `${API_BASE_URL}${endpoint}`);
    console.log('Headers:', JSON.stringify(headers, null, 2));

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized (token expired)
    if (response.status === 401) {
      // Try to refresh the token
      const refreshed = await refreshToken();

      if (refreshed) {
        // Retry the request with the new token
        const newAccessToken = await getAccessToken();
        const newHeaders = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newAccessToken}`,
          ...options.headers,
        };

        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers: newHeaders,
        });

        if (!retryResponse.ok) {
          const errorData = await retryResponse.json().catch(() => null);
          throw new AuthApiError(
            retryResponse.status,
            `API Error: ${retryResponse.statusText}`,
            errorData
          );
        }

        return retryResponse.json();
      } else {
        // Refresh failed, clear auth data
        await clearAuthData();
        throw new AuthApiError(401, 'Authentication expired');
      }
    }

    // Handle other non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new AuthApiError(
        response.status,
        `API Error: ${response.statusText}`,
        errorData
      );
    }

    // Try to parse JSON, but gracefully fail if there's no body
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    if (error instanceof AuthApiError) {
      throw error;
    }
    // Re-throw other errors
    console.error('Network or other error:', error);
    throw new Error('Network error: Unable to connect to the server');
  }
};

// Refresh token function
export const refreshToken = async (): Promise<boolean> => {
  try {
    const refreshToken = await AsyncStorage.getItem(AUTH_KEYS.REFRESH_TOKEN);
    if (!refreshToken) return false;

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    await AsyncStorage.setItem(AUTH_KEYS.ACCESS_TOKEN, data.access_token);

    // Update user info if provided
    if (data.user) {
      await AsyncStorage.setItem(
        AUTH_KEYS.USER_INFO,
        JSON.stringify(data.user)
      );
    }

    return true;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
};

// Clear all auth data from storage
export const clearAuthData = async (): Promise<void> => {
  await AsyncStorage.multiRemove([
    AUTH_KEYS.ACCESS_TOKEN,
    AUTH_KEYS.REFRESH_TOKEN,
    AUTH_KEYS.USER_INFO,
  ]);
};

// Get current user info
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const userJson = await AsyncStorage.getItem(AUTH_KEYS.USER_INFO);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

// Auth API functions
export const authApi = {
  // Get user profile
  getUserProfile: () => fetchWithAuth<User>('/auth/me'),

  // Update profile information
  updateProfile: (profileData: Partial<User>) =>
    fetchWithAuth<User>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    }),

  // Logout (invalidate refresh token)
  logout: async () => {
    try {
      const accessToken = await getAccessToken();
      if (accessToken) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
      }
      await clearAuthData();
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  },
};
