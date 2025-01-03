// app/onboarding.tsx
import { useState } from 'react';
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
import { saveChildren } from '../src/utils/storage';

type Child = {
  id: string;
  name: string;
  year: string | null;
  yearId: number | null;
};

export default function OnboardingScreen() {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([
    { id: '1', name: '', year: null, yearId: null },
  ]);

  const addChild = () => {
    setChildren([
      ...children,
      {
        id: (children.length + 1).toString(),
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
    // Validate that all children have years selected
    if (children.some((child) => !child.yearId)) {
      Alert.alert(
        'Missing Information',
        'Please select a year for each child before continuing.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Save children data
      await saveChildren(children);
      router.push('/home');
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
          <Text style={styles.title}>Add Your Children</Text>
          <Text style={styles.subtitle}>
            Enter details for each child to personalize their learning journey
          </Text>

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
