import Constants from 'expo-constants';

// Get environment variables with fallbacks
// This will provide values from a few possible sources with priority
const getEnvVariable = (key: string, defaultValue: string = ''): string => {
  // Try to get from Constants.expoConfig.extra first (app.config.js values)
  const fromExtra = (Constants.expoConfig?.extra as any)?.[key];

  // Then try process.env (direct Node.js environment)
  const fromProcess = process.env[key];

  // Use the first available value or fallback to default
  const value = fromExtra || fromProcess || defaultValue;

  return value;
};

// Environment variables with their fallbacks
export const ENV = {
  GOOGLE_WEB_CLIENT_ID: getEnvVariable('GOOGLE_WEB_CLIENT_ID', ''),
  GOOGLE_IOS_CLIENT_ID: getEnvVariable('GOOGLE_IOS_CLIENT_ID', ''),
  GOOGLE_ANDROID_CLIENT_ID: getEnvVariable('GOOGLE_ANDROID_CLIENT_ID', ''),
  API_URL: getEnvVariable(
    'API_URL',
    process.env.NODE_ENV === 'production'
      ? 'https://yayska-backend.vercel.app/api/v1'
      : 'http://localhost:8000/api/v1'
  ),
  IS_DEV: process.env.NODE_ENV !== 'production',
};

export default ENV;
