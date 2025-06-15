import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChildInput } from '../src/components/Onboarding/ChildInput';
import { YearSelector } from '../src/components/Onboarding/YearSelector';
import { colors, commonStyles } from '../src/theme/colors';
import {
  getChildren,
  saveChild,
  updateChild,
  deleteChild,
} from '../src/utils/storage';
import { Child } from '../src/types/child';
import { AppHeader } from '../src/components/Navigation/AppHeader';
import { UserProfile } from '../src/components/Auth/UserProfile';
import { Ionicons } from '@expo/vector-icons';

// Local type for editing state
type ChildEdit = {
  id: number | string; // number for existing, string for new
  name: string;
  year: string | null;
  yearId: number | null;
  isNew: boolean;
};

export default function ManageChildrenScreen() {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [editingChildren, setEditingChildren] = useState<ChildEdit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      setLoading(true);
      const savedChildren = await getChildren();
      setChildren(savedChildren);

      // Convert to editing format
      const editingData: ChildEdit[] = savedChildren.map((child) => ({
        id: child.id,
        name: child.name,
        year: child.year,
        yearId: child.yearId,
        isNew: false,
      }));

      setEditingChildren(editingData);
    } catch (error) {
      console.error('Error loading children:', error);
      Alert.alert('Error', 'Failed to load children. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addChild = () => {
    const newChild: ChildEdit = {
      id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      year: null,
      yearId: null,
      isNew: true,
    };
    setEditingChildren([...editingChildren, newChild]);
  };

  const removeChild = async (id: number | string) => {
    console.log('removeChild called with id:', id);
    console.log('editingChildren.length:', editingChildren.length);

    if (editingChildren.length <= 1) {
      console.log('Cannot remove - only one child left');
      if (Platform.OS === 'web') {
        alert('You must have at least one child to use the app.');
      } else {
        Alert.alert(
          'Cannot Remove',
          'You must have at least one child to use the app.',
          [{ text: 'OK' }]
        );
      }
      return;
    }

    const child = editingChildren.find((c) => c.id === id);
    console.log('Found child:', child);

    if (!child) {
      console.log('Child not found, returning');
      return;
    }

    if (child.isNew) {
      console.log('Child is new, removing from local state only');
      // Just remove from local state if it's a new child
      setEditingChildren(editingChildren.filter((c) => c.id !== id));
    } else {
      console.log('Child is existing, showing confirmation dialog');

      // Use platform-appropriate confirmation dialog
      let userConfirmed = false;

      if (Platform.OS === 'web') {
        userConfirmed = confirm(
          `Are you sure you want to permanently delete ${child.name}?\n\nThis will remove:\n• All learning progress and achievements\n• Personalized recommendations\n• Activity history and statistics\n• All associated data\n\nThis action cannot be undone.`
        );
        console.log('Web confirm result:', userConfirmed);
      } else {
        // For mobile platforms, use Alert.alert with Promise wrapper
        userConfirmed = await new Promise((resolve) => {
          Alert.alert(
            '⚠️ Delete Child',
            `Are you sure you want to permanently delete ${child.name}?\n\nThis will remove:\n• All learning progress and achievements\n• Personalized recommendations\n• Activity history and statistics\n• All associated data\n\nThis action cannot be undone.`,
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => {
                  console.log('User cancelled deletion');
                  resolve(false);
                },
              },
              {
                text: 'Delete Forever',
                style: 'destructive',
                onPress: () => {
                  console.log('User confirmed deletion');
                  resolve(true);
                },
              },
            ]
          );
        });
      }

      if (userConfirmed) {
        console.log('User confirmed deletion, starting process...');
        try {
          // Show loading state during deletion
          if (Platform.OS === 'web') {
            console.log('Starting deletion process...');
          } else {
            Alert.alert(
              'Deleting...',
              'Please wait while we remove all data for this child.',
              [],
              { cancelable: false }
            );
          }

          console.log('About to call deleteChild API with id:', child.id);
          // Immediately delete from backend
          await deleteChild(child.id as number);
          console.log('deleteChild API call completed successfully');

          // Remove from local state
          setEditingChildren(editingChildren.filter((c) => c.id !== id));
          console.log('Removed from editingChildren state');

          // Also remove from the original children state to keep them in sync
          setChildren(children.filter((c) => c.id !== id));
          console.log('Removed from children state');

          // Success confirmation with positive messaging
          if (Platform.OS === 'web') {
            alert(
              `${child.name} has been successfully deleted from your account.`
            );
          } else {
            Alert.alert(
              '✅ Child Deleted',
              `${child.name} has been successfully removed from your account. All associated data has been permanently deleted.`,
              [{ text: 'OK' }]
            );
          }
        } catch (error) {
          console.error('Error deleting child:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));

          if (Platform.OS === 'web') {
            alert(
              `Failed to delete ${child.name}. Please check your internet connection and try again.`
            );
          } else {
            Alert.alert(
              '❌ Deletion Failed',
              `We couldn't delete ${child.name} right now. Please check your internet connection and try again.`,
              [{ text: 'OK' }]
            );
          }
        }
      } else {
        console.log('User cancelled deletion');
      }
    }
  };

  const updateChildName = (id: number | string, name: string) => {
    setEditingChildren(
      editingChildren.map((child) =>
        child.id === id ? { ...child, name } : child
      )
    );
  };

  const updateChildYear = (
    id: number | string,
    yearId: number,
    yearName: string
  ) => {
    setEditingChildren(
      editingChildren.map((child) =>
        child.id === id ? { ...child, year: yearName, yearId } : child
      )
    );
  };

  const handleNavigation = () => {
    // Try to go back, but if there's no screen to go back to, go to home
    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/home');
      }
    } catch (error) {
      console.log('Navigation error, falling back to home:', error);
      router.replace('/home');
    }
  };

  const handleSave = async () => {
    // Validate all children have names and years
    const invalidChildren = editingChildren.filter(
      (child) => !child.name.trim() || !child.yearId
    );

    if (invalidChildren.length > 0) {
      if (Platform.OS === 'web') {
        alert('Please provide a name and select a school year for each child.');
      } else {
        Alert.alert(
          'Missing Information',
          'Please provide a name and select a school year for each child.',
          [{ text: 'OK' }]
        );
      }
      return;
    }

    try {
      setSaving(true);

      // Get original children to compare
      const originalChildren = children;

      // Note: Deletions are now handled immediately in removeChild function
      // No need to handle deletions here anymore

      // Handle updates and creations
      for (const editChild of editingChildren) {
        if (editChild.isNew) {
          // Create new child
          await saveChild(editChild.name.trim(), editChild.yearId!);
        } else {
          // Check if child was modified
          const originalChild = originalChildren.find(
            (oc) => oc.id === editChild.id
          );
          if (
            originalChild &&
            (originalChild.name !== editChild.name.trim() ||
              originalChild.yearId !== editChild.yearId)
          ) {
            await updateChild(
              originalChild.id,
              editChild.name.trim(),
              editChild.yearId!
            );
          }
        }
      }

      // Navigate back with proper fallback
      handleNavigation();
    } catch (error) {
      console.error('Error saving children:', error);
      if (Platform.OS === 'web') {
        alert('Failed to save changes. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to save changes. Please try again.', [
          { text: 'OK' },
        ]);
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleUserProfile = () => {
    setShowUserProfile(!showUserProfile);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.green} />
          <Text style={styles.loadingText}>Loading children...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        children={children}
        selectedChild={null}
        showChildrenMenu={false}
        toggleChildrenMenu={() => {}}
        selectChild={() => {}}
        toggleUserProfile={toggleUserProfile}
        showBackButton={true}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Manage Children</Text>
          <Text style={styles.subtitle}>
            Add, edit, or remove children and their school years.
          </Text>
        </View>

        <View style={styles.formContent}>
          {editingChildren.map((child, index) => (
            <View key={child.id} style={styles.childContainer}>
              <View style={styles.childHeader}>
                <Text style={styles.childNumber}>
                  {child.isNew
                    ? 'New Child'
                    : `${child.name || 'Child'} ${index + 1}`}
                </Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.removeButton,
                    pressed && styles.removeButtonPressed,
                  ]}
                  onPress={() => {
                    console.log('Trash button pressed for child:', child.id);
                    console.log('Child data:', child);
                    removeChild(child.id);
                  }}
                  onPressIn={() => console.log('Trash button press started')}
                  onPressOut={() => console.log('Trash button press ended')}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  testID={`delete-child-${child.id}`}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={colors.accent?.error || '#FF6B6B'}
                  />
                </Pressable>
              </View>

              <ChildInput
                childName={child.name}
                onNameChange={(text) => updateChildName(child.id, text)}
                onRemove={() => removeChild(child.id)}
                showRemove={false}
              />

              <Text style={styles.yearLabel}>Select school year:</Text>
              <View style={styles.yearSelectorContainer}>
                <YearSelector
                  selectedYear={child.year}
                  onYearSelect={(yearId, yearName) =>
                    updateChildYear(child.id, yearId, yearName)
                  }
                />
              </View>
            </View>
          ))}

          <Pressable style={styles.addButton} onPress={addChild}>
            <Ionicons
              name="add-circle-outline"
              size={20}
              color={colors.primary.green}
            />
            <Text style={styles.addButtonText}>Add Another Child</Text>
          </Pressable>

          <View style={styles.actionButtons}>
            <Pressable style={styles.cancelButton} onPress={handleNavigation}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={colors.neutral.white} />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {showUserProfile && (
        <View style={styles.profileOverlay}>
          <UserProfile
            isVisible={showUserProfile}
            onClose={() => setShowUserProfile(false)}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text.secondary,
  },
  content: {
    padding: 16,
  },
  formContent: {
    padding: 16,
    paddingTop: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: colors.text.secondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  childContainer: {
    marginBottom: 14,
    backgroundColor: colors.background.primary,
    padding: 12,
    borderRadius: commonStyles.borderRadius.medium,
    ...commonStyles.shadow,
  },
  childHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGrey,
  },
  childNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.green,
  },
  removeButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  removeButtonPressed: {
    backgroundColor: 'rgba(255, 107, 107, 0.3)',
    transform: [{ scale: 0.95 }],
  },
  yearLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 4,
    marginTop: 8,
  },
  yearSelectorContainer: {
    marginTop: 4,
  },
  addButton: {
    backgroundColor: colors.background.primary,
    padding: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: commonStyles.borderRadius.small,
    borderWidth: 1,
    borderColor: colors.primary.green,
    borderStyle: 'dashed',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  addButtonText: {
    color: colors.primary.green,
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: 12,
    borderRadius: commonStyles.borderRadius.medium,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral.grey,
  },
  cancelButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary.green,
    padding: 12,
    borderRadius: commonStyles.borderRadius.medium,
    alignItems: 'center',
    ...commonStyles.shadow,
  },
  saveButtonDisabled: {
    backgroundColor: colors.neutral.grey,
  },
  saveButtonText: {
    color: colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
  profileOverlay: {
    position: 'absolute',
    top: 60,
    right: 16,
    zIndex: 10,
  },
});
