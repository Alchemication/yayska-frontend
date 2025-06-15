// src/utils/storage.ts
import { api } from '../services/api';
import { Child } from '../types/child';

// Re-export Child type for backward compatibility
export { Child } from '../types/child';

// Simple API-based functions (no local storage)
export async function getChildren(): Promise<Child[]> {
  try {
    return await api.children.getAll();
  } catch (error) {
    console.error('Error getting children:', error);
    return [];
  }
}

export async function saveChild(name: string, yearId: number): Promise<Child> {
  try {
    return await api.children.create({
      name,
      school_year_id: yearId,
    });
  } catch (error) {
    console.error('Error saving child:', error);
    throw error;
  }
}

export async function updateChild(
  id: number,
  name: string,
  yearId: number
): Promise<Child> {
  try {
    return await api.children.update(id, {
      name,
      school_year_id: yearId,
    });
  } catch (error) {
    console.error('Error updating child:', error);
    throw error;
  }
}

export async function deleteChild(id: number): Promise<void> {
  try {
    await api.children.delete(id);
  } catch (error) {
    console.error('Error deleting child:', error);
    throw error;
  }
}

// For backward compatibility - these functions are now no-ops or API calls
export async function saveChildren(children: Child[]): Promise<void> {
  // This function is no longer needed with API-first approach
  console.warn('saveChildren is deprecated - use individual API calls');
}

export async function addChildren(newChildren: Child[]): Promise<void> {
  // Create each child via API
  for (const child of newChildren) {
    await saveChild(child.name, child.yearId);
  }
}

export async function clearChildren(): Promise<void> {
  try {
    const children = await getChildren();
    for (const child of children) {
      await deleteChild(child.id);
    }
  } catch (error) {
    console.error('Error clearing children:', error);
    throw error;
  }
}

// Deprecated - no longer needed with API
export async function ensureChildrenHaveYearNames(): Promise<void> {
  // No-op - API always returns year names
}
