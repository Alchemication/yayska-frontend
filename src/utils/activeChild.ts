import AsyncStorage from '@react-native-async-storage/async-storage';
import { Child } from '../types/child';

const ACTIVE_CHILD_KEY = '@yayska_active_child';

export interface ActiveChildState {
  childId: number;
  childName: string;
  lastSelected: string; // ISO date string
}

/**
 * Get the currently active child from storage
 */
export const getActiveChild = async (): Promise<ActiveChildState | null> => {
  try {
    const stored = await AsyncStorage.getItem(ACTIVE_CHILD_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as ActiveChildState;
    return parsed;
  } catch (error) {
    console.error('Error getting active child:', error);
    return null;
  }
};

/**
 * Set the active child in storage
 */
export const setActiveChild = async (child: Child): Promise<void> => {
  try {
    const activeState: ActiveChildState = {
      childId: child.id,
      childName: child.name,
      lastSelected: new Date().toISOString(),
    };

    await AsyncStorage.setItem(ACTIVE_CHILD_KEY, JSON.stringify(activeState));
  } catch (error) {
    console.error('Error setting active child:', error);
    throw error;
  }
};

/**
 * Clear the active child from storage
 */
export const clearActiveChild = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ACTIVE_CHILD_KEY);
  } catch (error) {
    console.error('Error clearing active child:', error);
    throw error;
  }
};

/**
 * Get the active child from a list of children, with fallback logic
 */
export const resolveActiveChild = async (
  children: Child[]
): Promise<Child | null> => {
  if (children.length === 0) return null;

  // If only one child, return it
  if (children.length === 1) {
    await setActiveChild(children[0]); // Ensure it's stored
    return children[0];
  }

  // Try to get stored active child
  const activeState = await getActiveChild();
  if (activeState) {
    const activeChild = children.find(
      (child) => child.id === activeState.childId
    );
    if (activeChild) {
      return activeChild;
    }
  }

  // Fallback to first child and store it
  const firstChild = children[0];
  await setActiveChild(firstChild);
  return firstChild;
};
