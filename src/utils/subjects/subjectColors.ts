/**
 * Subject color mapping for consistent color coding across the application
 */

// Comprehensive mapping of all subjects to colors
export const subjectColors: Record<string, string> = {
  // Language subjects
  English: '#5A7D9A', // Slate Blue
  Gaeilge: '#34a853', // Unchanged - Core brand color
  Language: '#5A7D9A', // For backward compatibility
  Reading: '#5A7D9A', // For backward compatibility

  // STEM subjects
  Mathematics: '#8E7C93', // Heather
  Math: '#8E7C93', // For backward compatibility
  Science: '#2E8B57', // Sea Green

  // Humanities
  History: '#EAA221', // Marigold
  Geography: '#6A8D73', // Lichen Green
  'Social Studies': '#EAA221', // For backward compatibility
  'Social, Personal and Health Education': '#F09A7A', // Soft Coral

  // Arts subjects
  'Visual Arts': '#C34423', // Burnt Sienna
  Arts: '#C34423', // For backward compatibility
  Music: '#B5A2C8', // Dusty Lavender
  Drama: '#D8A0A6', // Rose Dust

  // Physical subjects
  'Physical Education': '#4682B4', // Steel Blue
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
