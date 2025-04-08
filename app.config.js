require('dotenv').config();

module.exports = {
  name: 'Yayska',
  slug: 'yayska',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#FFFFFF',
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.yourcompany.yayska',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FFFFFF',
    },
    package: 'com.yourcompany.yayska',
  },
  web: {
    favicon: './assets/images/favicon.png',
    bundler: 'metro',
    output: 'single',
    rewrite: {
      // Don't redirect auth callbacks to root, let them render their own page first
      // '/auth/google/callback': '/',
      // '/auth/google/callback/*': '/',
      '/auth': '/',
      '/auth/*': '/',
    },
  },
  extra: {
    // These values are read from the process.env at build time
    // Hardcode the web client ID as a fallback while debugging
    GOOGLE_WEB_CLIENT_ID:
      process.env.GOOGLE_WEB_CLIENT_ID ||
      '1098397716397-q60qv7i0bd5jh56ck95tk1mh9ht9ck5n.apps.googleusercontent.com',
    GOOGLE_IOS_CLIENT_ID: process.env.GOOGLE_IOS_CLIENT_ID,
    GOOGLE_ANDROID_CLIENT_ID: process.env.GOOGLE_ANDROID_CLIENT_ID,
    API_URL: process.env.API_URL || 'http://localhost:8000/api/v1',
    eas: {
      projectId: 'your-eas-project-id',
    },
  },
};
