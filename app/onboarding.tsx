// app/onboarding.tsx
import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChildInput } from '../src/components/Onboarding/ChildInput';
import { YearSelector } from '../src/components/Onboarding/YearSelector';
import { colors, commonStyles } from '../src/theme/colors';
import { useLocalSearchParams } from 'expo-router';
import { saveChildren, addChildren } from '../src/utils/storage';
import {
  EDUCATION_LEVELS,
  SCHOOL_YEARS,
  getSchoolYearsByLevelId,
} from '../src/constants/education';
import { enrichChildWithYearName } from '../src/utils/educationUtils';

type Child = {
  id: string;
  name: string;
  year: string | null;
  yearId: number | null;
};

export default function OnboardingScreen() {
  const { mode } = useLocalSearchParams<{ mode?: 'add' }>();
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([
    {
      id: `child-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      year: null,
      yearId: null,
    },
  ]);

  const [educationLevels, setEducationLevels] = useState<EducationLevel[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEducationLevels(EDUCATION_LEVELS);

    if (EDUCATION_LEVELS.length === 1) {
      setSelectedLevelId(EDUCATION_LEVELS[0].id);
      setSchoolYears(getSchoolYearsByLevelId(EDUCATION_LEVELS[0].id));
    }
  }, []);

  useEffect(() => {
    if (selectedLevelId) {
      setLoading(true);
      setSchoolYears(getSchoolYearsByLevelId(selectedLevelId));
      setLoading(false);
    }
  }, [selectedLevelId]);

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
        'Please select a year for each child before continuing.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      if (mode === 'add') {
        await addChildren(children);
      } else {
        await saveChildren(children);
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

  const handleSaveChild = async () => {
    // ... your existing saving logic

    // When creating a child, use enrichChildWithYearName
    const newChild = await saveChild(name, selectedYearId);
    const enrichedChild = enrichChildWithYearName(newChild);

    // ... rest of saving logic
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>
            {mode === 'add' ? 'Add More Children' : 'Welcome to Yayska!'}
          </Text>
          <Text style={styles.subtitle}>
            {mode === 'add'
              ? 'Add details for additional children.'
              : "Let's personalize your experience by adding your children's details."}
          </Text>

          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>Getting Started:</Text>
            <Text style={styles.instructionText}>
              1. Add each child's name (optional)
            </Text>
            <Text style={styles.instructionText}>
              2. Select their current school year
            </Text>
            <Text style={styles.instructionText}>
              3. Add more children if needed
            </Text>
          </View>

          {children.map((child) => (
            <View key={child.id} style={styles.childContainer}>
              <ChildInput
                childName={child.name}
                onNameChange={(text) => updateChildName(child.id, text)}
                onRemove={() => removeChild(child.id)}
                showRemove={children.length > 1}
              />
              <Text style={styles.yearLabel}>Select year:</Text>
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
            <Text style={styles.continueButtonText}>
              Continue to Learning Goals
            </Text>
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
  instructionsCard: {
    backgroundColor: colors.background.primary,
    padding: 16,
    borderRadius: commonStyles.borderRadius.medium,
    marginBottom: 24,
    ...commonStyles.shadow,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
    lineHeight: 20,
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
