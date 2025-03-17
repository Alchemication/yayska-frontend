import { Child } from './storage'; // Import only the type
import { getYearNameById } from './schoolYearUtils';

// Function to get the display name for a child (including year if available)
export const getChildDisplayName = (child: Child | null): string => {
  if (!child) return 'Select Child';

  // Get year name from our static data
  const yearName = getYearNameById(child.yearId);

  // If we have a year name, display it with it
  if (yearName) {
    return `${child.name} (${yearName})`;
  }

  // If we don't have a year name but have child.year, use that
  if (child.year) {
    return `${child.name} (${child.year})`;
  }

  // Otherwise just return the child's name
  return child.name;
};

// Function to get just the year name for a child
export const getChildYearName = (child: Child | null): string => {
  if (!child) return '';

  // Try to get year name from our static data first
  const yearName = getYearNameById(child.yearId);
  if (yearName) return yearName;

  // Fall back to child.year if available
  return child.year || '';
};
