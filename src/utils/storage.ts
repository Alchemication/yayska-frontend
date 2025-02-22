// src/utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Child = {
  id: string;
  name: string;
  year: string | null;
  yearId: number | null;
};

const STORAGE_KEYS = {
  CHILDREN: 'yayska_children',
} as const;

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
