// src/theme/colors.ts
export const colors = {
  // Primary colors (Irish flag inspired)
  primary: {
    green: '#169B62', // A more muted green than flag green
    greenLight: '#1FB774', // Lighter shade for hover states
    greenDark: '#0B754A', // Darker shade for contrast

    orange: '#FF8C37', // Softer orange than flag orange
    orangeLight: '#FFA864',
    orangeDark: '#F67D24',
  },

  // Neutral colors
  neutral: {
    white: '#FFFFFF',
    offWhite: '#F5F5F5',
    lightGrey: '#E8E8E8',
    grey: '#9DA3AE',
    darkGrey: '#4A4A4A',
    black: '#1A1A1A',
  },

  // Accent colors for various UI elements
  accent: {
    success: '#169B62', // Using our green
    error: '#FF4D4D',
    warning: '#FF8C37', // Using our orange
    info: '#2196F3',
  },

  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
    tertiary: '#E8E8E8',
  },

  // Text colors
  text: {
    primary: '#1A1A1A',
    secondary: '#4A4A4A',
    tertiary: '#9DA3AE',
  },
};

// Common styles
export const commonStyles = {
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
  },
};
