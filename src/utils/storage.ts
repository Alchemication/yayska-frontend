// src/utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getYearNameById } from '../constants/education';

export interface Child {
  id: string;
  name: string;
  yearId: number;
  year?: string;
}

const STORAGE_KEYS = {
  CHILDREN: 'yayska_children',
} as const;

// Helper function to generate unique IDs
const generateId = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

export async function saveChildren(children: Child[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(children));
  } catch (error) {
    console.error('Error saving children:', error);
    throw error;
  }
}

export async function getChildren(): Promise<Child[] | null> {
  try {
    const childrenJson = await AsyncStorage.getItem(STORAGE_KEYS.CHILDREN);
    return childrenJson ? JSON.parse(childrenJson) : null;
  } catch (error) {
    console.error('Error getting children:', error);
    return null;
  }
}

export async function addChildren(newChildren: Child[]): Promise<void> {
  try {
    const existingChildren = (await getChildren()) || [];
    const allChildren = [...existingChildren, ...newChildren];
    await AsyncStorage.setItem(
      STORAGE_KEYS.CHILDREN,
      JSON.stringify(allChildren)
    );
  } catch (error) {
    console.error('Error adding children:', error);
    throw error;
  }
}

export async function clearChildren(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.CHILDREN);
  } catch (error) {
    console.error('Error clearing children:', error);
    throw error;
  }
}

export const saveChild = async (
  name: string,
  yearId: number
): Promise<Child> => {
  try {
    const children = (await getChildren()) || [];

    const newChild: Child = {
      id: generateId(),
      name,
      yearId,
      year: getYearNameById(yearId),
    };

    const updatedChildren = [...children, newChild];
    await AsyncStorage.setItem(
      STORAGE_KEYS.CHILDREN,
      JSON.stringify(updatedChildren)
    );

    return newChild;
  } catch (error) {
    console.error('Error saving child:', error);
    throw error;
  }
};

export const ensureChildrenHaveYearNames = async (): Promise<void> => {
  try {
    const children = await getChildren();
    if (!children) return;

    let needsUpdate = false;

    const updatedChildren = children.map((child) => {
      if (!child.year && child.yearId) {
        needsUpdate = true;
        return {
          ...child,
          year: getYearNameById(child.yearId),
        };
      }
      return child;
    });

    if (needsUpdate) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CHILDREN,
        JSON.stringify(updatedChildren)
      );
    }
  } catch (error) {
    console.error('Error updating children year names:', error);
  }
};
