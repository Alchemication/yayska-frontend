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
        <View style={styles.content}>
          {mode === 'add' ? (
            <Text style={styles.title}>Add Children</Text>
          ) : (
            <View style={styles.welcomeContainer}>
              <Image
                source={require('../assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.welcomeText}>Welcome!</Text>
            </View>
          )}
          <Text style={styles.subtitle}>
            {mode === 'add'
              ? 'Add each child and select their school year.'
              : "Tell us who you'll be helping with their schoolwork."}
          </Text>

          {children.map((child) => (
            <View key={child.id} style={styles.childContainer}>
              <ChildInput
                childName={child.name}
                onNameChange={(text) => updateChildName(child.id, text)}
                onRemove={() => removeChild(child.id)}
                showRemove={children.length > 1}
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
    padding: 20,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    width: 200,
    height: 80,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  childContainer: {
    marginBottom: 24,
    backgroundColor: colors.background.primary,
    padding: 16,
    borderRadius: commonStyles.borderRadius.medium,
    ...commonStyles.shadow,
  },
  yearLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 8,
    marginTop: 16,
  },
  addButton: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  addButtonText: {
    color: colors.primary.green,
    fontSize: 16,
    fontWeight: '500',
  },
  continueButton: {
    backgroundColor: colors.primary.green,
    padding: 16,
    borderRadius: commonStyles.borderRadius.medium,
    alignItems: 'center',
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
