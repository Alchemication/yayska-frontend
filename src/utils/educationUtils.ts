import { getChildren, setChildren, Child } from './storage';
import { getYearNameById } from '../constants/education';

// Function to ensure all children have year names
export const updateChildrenWithYearNames = async (): Promise<void> => {
  try {
    const children = await getChildren();
    if (!children || children.length === 0) return;

    let hasChanges = false;

    const updatedChildren = children.map((child) => {
      if (!child.year && child.yearId) {
        hasChanges = true;
        return {
          ...child,
          year: getYearNameById(child.yearId),
        };
      }
      return child;
    });

    if (hasChanges) {
      await setChildren(updatedChildren);
    }
  } catch (error) {
    console.error('Error updating children with year names:', error);
  }
};

// Helper to ensure a newly created child has a year name
export const enrichChildWithYearName = (child: Child): Child => {
  if (!child.year && child.yearId) {
    return {
      ...child,
      year: getYearNameById(child.yearId),
    };
  }
  return child;
};
