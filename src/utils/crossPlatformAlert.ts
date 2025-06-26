import { Alert, Platform } from 'react-native';

/**
 * Displays a cross-platform alert.
 * Uses native Alert on iOS/Android and browser alert on web.
 * @param title The title of the alert.
 * @param message The message to display.
 */
export const crossPlatformAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    // Browser alert doesn't support titles directly, so we combine them.
    // The title is important for context.
    alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};
