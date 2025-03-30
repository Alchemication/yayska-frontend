// src/theme/colors.ts
export const colors = {
  // Primary colors (Irish flag inspired)
  primary: {
    green: '#267255', // Updated to a deeper green that matches the logo better
    greenLight: '#348C6A', // Lighter shade for hover states
    greenDark: '#1A5B42', // Darker shade for contrast

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
    success: '#267255', // Using our updated green
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
    primary: '#252322', // Updated to a softer off-black with slight warm undertone
    secondary: '#4A4A4A',
    tertiary: '#9DA3AE',
  },

  // Difficulty colors
  difficulty: {
    easy: '#4CAF50', // Green
    medium: '#FF9800', // Orange
    hard: '#F44336', // Red
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
