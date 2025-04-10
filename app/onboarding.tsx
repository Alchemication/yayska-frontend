// app/onboarding.tsx
import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChildInput } from '../src/components/Onboarding/ChildInput';
import { YearSelector } from '../src/components/Onboarding/YearSelector';
import { colors, commonStyles } from '../src/theme/colors';
import { useLocalSearchParams } from 'expo-router';
import {
  saveChildren,
  addChildren,
  Child as StorageChild,
  getChildren,
} from '../src/utils/storage';
import {
  EDUCATION_LEVELS,
  SCHOOL_YEARS,
  getSchoolYearsByLevelId,
} from '../src/constants/education';
import { enrichChildWithYearName } from '../src/utils/educationUtils';
import { useAuth } from '../src/context/AuthContext';

// Use a local type for the state that can have null values during input
type ChildInput = {
  id: string;
  name: string;
  year: string | null;
  yearId: number | null;
};

export default function OnboardingScreen() {
  const { mode } = useLocalSearchParams<{ mode?: 'add' }>();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  const [children, setChildren] = useState<ChildInput[]>([
    {
      id: `child-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      year: null,
      yearId: null,
    },
  ]);

  const [loading, setLoading] = useState(false);

  // Check if we should redirect based on existing children
  useEffect(() => {
    const checkForExistingChildren = async () => {
      try {
        console.log('[Onboarding] Checking for existing children');
        // Only do this check for returning users, not new users
        if (isAuthenticated && !mode) {
          const existingChildren = await getChildren();

          // If we already have children and we're not explicitly in "add" mode, go to home
          if (existingChildren && existingChildren.length > 0) {
            console.log(
              '[Onboarding] Found existing children, redirecting to home'
            );
            router.replace('/home');
          } else {
            console.log(
              '[Onboarding] No existing children found, staying on onboarding'
            );
          }
        }
      } catch (error) {
        console.error('[Onboarding] Error checking for children:', error);
      }
    };

    checkForExistingChildren();
  }, [isAuthenticated, mode, router]);

  const addChild = () => {
    setChildren([
      ...children,
      {
        id: `child-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: '',
        year: null,
        yearId: null,
      },
    ]);
  };

  const removeChild = (id: string) => {
    if (children.length > 1) {
      setChildren(children.filter((child) => child.id !== id));
    }
  };

  const updateChildName = (id: string, name: string) => {
    setChildren(
      children.map((child) => (child.id === id ? { ...child, name } : child))
    );
  };

  const updateChildYear = (id: string, yearId: number, yearName: string) => {
    setChildren(
      children.map((child) =>
        child.id === id ? { ...child, year: yearName, yearId } : child
      )
    );
  };

  const handleContinue = async () => {
    if (children.some((child) => !child.yearId)) {
      Alert.alert(
        'Missing Information',
        'Please select a school year for each child before continuing.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Convert to the storage format (year is optional, yearId is required)
      const childrenToSave: StorageChild[] = children.map((child) => ({
        id: child.id,
        name: child.name,
        yearId: child.yearId || 0,
        year: child.year || undefined,
      }));

      if (mode === 'add') {
        await addChildren(childrenToSave);
      } else {
        await saveChildren(childrenToSave);
      }
      router.replace('/home');
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to save children information. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {mode === 'add' ? (
          <View style={styles.content}>
            <Text style={styles.title}>Add Children</Text>
            <Text style={styles.subtitle}>
              Add each child and select their school year.
            </Text>
          </View>
        ) : (
          <View style={styles.headerContainer}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.headerSubtitle}>
              Tell us who you'll be helping with their schoolwork.
            </Text>
          </View>
        )}

        <View style={styles.formContent}>
          {children.map((child, index) => (
            <View key={child.id} style={styles.childContainer}>
              <View style={styles.childHeader}>
                <Text style={styles.childNumber}>Child {index + 1}</Text>
                {children.length > 1 && (
                  <Pressable
                    style={styles.removeButton}
                    onPress={() => removeChild(child.id)}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </Pressable>
                )}
              </View>
              <ChildInput
                childName={child.name}
                onNameChange={(text) => updateChildName(child.id, text)}
                onRemove={() => removeChild(child.id)}
                showRemove={false}
              />
              <Text style={styles.yearLabel}>Select school year:</Text>
              <YearSelector
                selectedYear={child.year}
                onYearSelect={(yearId, yearName) =>
                  updateChildYear(child.id, yearId, yearName)
                }
              />
            </View>
          ))}

          <Pressable style={styles.addButton} onPress={addChild}>
            <Text style={styles.addButtonText}>+ Add Another Child</Text>
          </Pressable>

          <Pressable
            style={[
              styles.continueButton,
              !children.every((child) => child.yearId) &&
                styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </Pressable>
        </View>
      </ScrollView>
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
  content: {
    padding: 16,
  },
  formContent: {
    padding: 16,
    paddingTop: 0,
  },
  headerContainer: {
    backgroundColor: colors.background.secondary,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  logo: {
    width: 140,
    height: 36,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 6,
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
    marginBottom: 16,
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
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGrey,
  },
  childNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.green,
  },
  removeButton: {
    padding: 4,
  },
  removeButtonText: {
    fontSize: 14,
    color: colors.accent.error,
  },
  yearLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 6,
    marginTop: 10,
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
  },
  addButtonText: {
    color: colors.primary.green,
    fontSize: 16,
    fontWeight: '500',
  },
  continueButton: {
    backgroundColor: colors.primary.green,
    padding: 14,
    borderRadius: commonStyles.borderRadius.medium,
    alignItems: 'center',
    marginBottom: 24,
    ...commonStyles.shadow,
  },
  continueButtonDisabled: {
    backgroundColor: colors.neutral.grey,
  },
  continueButtonText: {
    color: colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
