/**
 * Subject color mapping for consistent color coding across the application
 */

// Comprehensive mapping of all subjects to colors
export const subjectColors: Record<string, string> = {
  // Language subjects
  English: '#4285f4', // Google Blue
  Gaeilge: '#34a853', // Google Green
  Language: '#4285f4', // For backward compatibility
  Reading: '#4285f4', // For backward compatibility

  // STEM subjects
  Mathematics: '#9c27b0', // Purple
  Math: '#9c27b0', // For backward compatibility
  Science: '#00acc1', // Teal

  // Humanities
  History: '#f4b400', // Google Yellow
  Geography: '#0f9d58', // Emerald Green
  'Social Studies': '#f4b400', // For backward compatibility
  'Social, Personal and Health Education': '#ff5722', // Deep Orange

  // Arts subjects
  'Visual Arts': '#ea4335', // Google Red
  Arts: '#ea4335', // For backward compatibility
  Music: '#9575cd', // Light Purple
  Drama: '#e91e63', // Pink

  // Physical subjects
  'Physical Education': '#2196f3', // Light Blue
};

/**
 * Get color for a specific subject
 * @param subjectName The name of the subject
 * @param fallbackColor Optional fallback color if subject not found
 * @returns The color code for the subject
 */
export const getSubjectColor = (
  subjectName: string,
  fallbackColor = '#34a853'
): string => {
  return subjectColors[subjectName] || fallbackColor;
};

/**
 * Get text color that contrasts well with the subject color (for text on subject color backgrounds)
 * @param subjectName The name of the subject
 * @returns White or black depending on background color darkness
 */
export const getSubjectTextColor = (subjectName: string): string => {
  const color = getSubjectColor(subjectName);

  // Simple algorithm to determine if color is dark (use white text) or light (use black text)
  // Convert hex to RGB and calculate luminance
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  // Calculate luminance (perceived brightness)
  // Formula: 0.299*R + 0.587*G + 0.114*B
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#000000' : '#ffffff';
};
