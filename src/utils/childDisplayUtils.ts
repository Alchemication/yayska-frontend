import { Child } from '../types/child';
import { getYearNameById } from './schoolYearUtils';

// Function to get the display name for a child (including year if available)
export const getChildDisplayName = (child: Child | null): string => {
  if (!child) return 'Select Child';

  // API always provides year name, so use it directly
  if (child.year) {
    return `${child.name} (${child.year})`;
  }

  // Fallback to getting year name from static data
  const yearName = getYearNameById(child.yearId);
  if (yearName) {
    return `${child.name} (${yearName})`;
  }

  // Otherwise just return the child's name
  return child.name;
};

// Function to get just the year name for a child
export const getChildYearName = (child: Child | null): string => {
  if (!child) return '';

  // API provides year name directly
  if (child.year) return child.year;

  // Fallback to static data
  return getYearNameById(child.yearId) || '';
};
