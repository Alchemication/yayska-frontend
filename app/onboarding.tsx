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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ChildInput } from '../src/components/Onboarding/ChildInput';
import { YearSelector } from '../src/components/Onboarding/YearSelector';
import { colors, commonStyles } from '../src/theme/colors';
import { saveChild } from '../src/utils/storage';
import { CHILD_INTERESTS, CORE_SUBJECTS } from '../src/constants/education';
import { useAuth } from '../src/context/AuthContext';
import { trackEvent } from '../src/utils/analytics';
import { SelectionGrid } from '../src/components/Onboarding/SelectionGrid';
import { api } from '../src/services/api';

type OnboardingStepName =
  | 'welcome'
  | 'parentSubjects'
  | 'childDetails'
  | 'childInterests'
  | 'summary';

type OnboardingStep = {
  name: OnboardingStepName;
  childIndex?: number; // Used for the childInterests step
};

// Enhanced child state to include new memory fields
type ChildState = {
  id: string;
  name: string;
  year: string | null;
  yearId: number | null;
  memory: {
    interests?: string[];
  };
};

export default function OnboardingScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [step, setStep] = useState<OnboardingStep>({ name: 'welcome' });
  const [loading, setLoading] = useState(false);
  const [magicRevealText, setMagicRevealText] = useState<string | null>(null);

  // State now handles multiple children
  const [children, setChildren] = useState<ChildState[]>([
    {
      id: `child-${Date.now()}`,
      name: '',
      year: null,
      yearId: null,
      memory: {},
    },
  ]);

  // State for parent's memory
  const [parentMemory, setParentMemory] = useState({
    challenge_subjects: [] as string[],
  });

  useEffect(() => {
    trackEvent('ONBOARDING_STARTED', { flow_version: 'v2-multi-child' });
  }, []);

  const addChild = () => {
    const newChild: ChildState = {
      id: `child-${Date.now()}-${Math.random()}`,
      name: '',
      year: null,
      yearId: null,
      memory: {},
    };
    setChildren([...children, newChild]);
  };

  const removeChild = (id: string) => {
    if (children.length > 1) {
      setChildren(children.filter((c) => c.id !== id));
    }
  };

  const updateChildField = (
    id: string,
    field: keyof ChildState,
    value: any
  ) => {
    setChildren(
      children.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const updateChildYear = (id: string, yearId: number, yearName: string) => {
    setChildren(
      children.map((c) => (c.id === id ? { ...c, yearId, year: yearName } : c))
    );
  };

  const toggleChildInterest = (childIndex: number, interestId: string) => {
    const updatedChildren = [...children];
    const child = updatedChildren[childIndex];
    const currentInterests = child.memory.interests || [];
    const newInterests = currentInterests.includes(interestId)
      ? currentInterests.filter((id) => id !== interestId)
      : [...currentInterests, interestId];

    child.memory.interests = newInterests;
    setChildren(updatedChildren);

    // Update magic reveal text
    const lastSelectedInterest = CHILD_INTERESTS.find(
      (i) => i.id === interestId
    );
    if (newInterests.length > 0 && lastSelectedInterest) {
      setMagicRevealText(`Great! We can ${lastSelectedInterest.example}`);
    } else {
      setMagicRevealText(null);
    }
  };

  const toggleParentSubject = (subjectId: string) => {
    const currentSubjects = parentMemory.challenge_subjects;
    const newSubjects = currentSubjects.includes(subjectId)
      ? currentSubjects.filter((id) => id !== subjectId)
      : [...currentSubjects, subjectId];

    setParentMemory({ ...parentMemory, challenge_subjects: newSubjects });

    // Update magic reveal text
    if (newSubjects.length > 0) {
      setMagicRevealText(
        `No problem! We'll provide extra-clear parent guides and quick tips for ${subjectId}.`
      );
    } else {
      setMagicRevealText(null);
    }
  };

  const handleNextStep = () => {
    setMagicRevealText(null); // Reset magic text on each transition

    switch (step.name) {
      case 'welcome':
        setStep({ name: 'parentSubjects' });
        break;
      case 'parentSubjects':
        setStep({ name: 'childDetails' });
        break;
      case 'childDetails':
        for (const child of children) {
          if (!child.name.trim()) {
            Alert.alert('Missing Name', `Please enter a name for each child.`);
            return;
          }
          if (!child.yearId) {
            Alert.alert(
              'Missing School Year',
              `Please select a school year for ${child.name}.`
            );
            return;
          }
        }
        setStep({ name: 'childInterests', childIndex: 0 });
        break;
      case 'childInterests':
        const nextChildIndex = (step.childIndex ?? 0) + 1;
        if (nextChildIndex < children.length) {
          setStep({ name: 'childInterests', childIndex: nextChildIndex });
        } else {
          setStep({ name: 'summary' });
        }
        break;
      case 'summary':
        handleOnboardingComplete();
        break;
    }
  };

  const handleOnboardingComplete = async () => {
    setLoading(true);
    try {
      // 1. Update the Parent's profile first
      await api.user.updateMe({
        memory: {
          onboarding: {
            completed_at: new Date().toISOString(),
            flow_version: 'v2-multi-child',
          },
          learning_context: {
            challenge_subjects: parentMemory.challenge_subjects,
          },
        },
      });
      console.log('Parent profile updated successfully');

      // 2. Create all children in parallel
      const childCreationPromises = children.map((child) => {
        const childMemory = {
          interests: child.memory.interests || [],
        };
        return saveChild(child.name, child.yearId!, childMemory);
      });

      await Promise.all(childCreationPromises);
      console.log(`${children.length} child/children created successfully`);

      await trackEvent('ONBOARDING_COMPLETED', {
        flow_version: 'v2-multi-child',
        children_count: children.length,
        parent_challenges_count: parentMemory.challenge_subjects.length,
      });

      router.replace('/home');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert(
        'Error',
        'Could not save your information. Please try again.'
      );
      trackEvent('ONBOARDING_FAILED', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step.name) {
      case 'welcome':
        return (
          <View style={styles.stepContainer}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
            />
            <Text style={styles.title}>Dia dhuit!</Text>
            <Text style={styles.subtitle}>
              Thank you for joining Yayska community! Let's get started by
              introducing yourself and your children to tailor the app to your
              needs.
            </Text>
          </View>
        );
      case 'parentSubjects':
        return (
          <SelectionGrid
            title="What subjects do you find challenging?"
            subtitle="This helps me understand what topics to provide more guidance on for you."
            items={CORE_SUBJECTS.map((subject) => ({
              ...subject,
              example: '',
            }))}
            selectedItems={parentMemory.challenge_subjects}
            onToggleItem={toggleParentSubject}
            magicRevealText={magicRevealText}
          />
        );
      case 'childDetails':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Great! Now, who are the learners?</Text>
            <Text style={styles.subtitle}>
              Add your children's details below.
            </Text>
            {children.map((child, index) => (
              <View key={child.id} style={styles.childContainer}>
                <View style={styles.childHeader}>
                  <Text style={styles.childNumberText}>Child {index + 1}</Text>
                  {children.length > 1 && (
                    <Pressable onPress={() => removeChild(child.id)}>
                      <Text style={styles.removeText}>Remove</Text>
                    </Pressable>
                  )}
                </View>
                <ChildInput
                  childName={child.name}
                  onNameChange={(name) =>
                    updateChildField(child.id, 'name', name)
                  }
                  showRemove={false}
                  onRemove={() => {}}
                />
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
          </View>
        );
      case 'childInterests':
        const currentChild = children[step.childIndex ?? 0];
        return (
          <SelectionGrid
            title={`What makes ${currentChild.name} tick?`}
            subtitle="This is our secret weapon! Pick a few topics they love, and we'll use them to make learning feel like play."
            items={CHILD_INTERESTS}
            selectedItems={currentChild.memory.interests || []}
            onToggleItem={(id) => toggleChildInterest(step.childIndex ?? 0, id)}
            magicRevealText={magicRevealText}
          />
        );
      case 'summary':
        return (
          <View style={styles.stepContainer}>
            <Ionicons
              name="checkmark-circle"
              size={80}
              color={colors.primary.green}
              style={{ alignSelf: 'center', marginBottom: 20 }}
            />
            <Text style={styles.title}>All set! Your Yayska is ready.</Text>
            <Text style={styles.subtitle}>
              Here’s a quick look at what you can do:
            </Text>

            <View style={styles.bulletList}>
              <View style={styles.bulletPointContainer}>
                <Text style={styles.bulletIcon}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>See Monthly Learning:</Text> Know
                  what your child is studying each month.
                </Text>
              </View>
              <View style={styles.bulletPointContainer}>
                <Text style={styles.bulletIcon}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>Explore All Subjects:</Text> Dive
                  deep into any curriculum topic.
                </Text>
              </View>
              <View style={styles.bulletPointContainer}>
                <Text style={styles.bulletIcon}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>Chat with Yay:</Text> Get simple
                  explanations and parent-friendly tips.
                </Text>
              </View>
            </View>
          </View>
        );
    }
  };

  const getProgress = () => {
    const totalSteps = 3 + children.length; // welcome, parent, details + N interests + summary
    let currentStepNum = 0;
    switch (step.name) {
      case 'welcome':
        currentStepNum = 1;
        break;
      case 'parentSubjects':
        currentStepNum = 2;
        break;
      case 'childDetails':
        currentStepNum = 3;
        break;
      case 'childInterests':
        currentStepNum = 3 + (step.childIndex ?? 0) + 1;
        break;
      case 'summary':
        currentStepNum = totalSteps;
        break;
    }
    return currentStepNum / totalSteps;
  };

  const getButtonText = () => {
    if (step.name === 'summary') {
      return 'Start Exploring the Curriculum';
    }
    if (step.name === 'parentSubjects') {
      return 'Next';
    }
    if (step.name === 'childDetails') {
      return 'Next';
    }
    if (
      step.name === 'childInterests' &&
      (step.childIndex ?? 0) === children.length - 1
    ) {
      return 'Finish Setup';
    }
    return "Let's Yay!";
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressBarContainer}>
        <View
          style={[styles.progressBar, { width: `${getProgress() * 100}%` }]}
        />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderStep()}
      </ScrollView>
      <View style={styles.footer}>
        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleNextStep}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{getButtonText()}</Text>
          )}
        </Pressable>
        <Pressable
          style={styles.logoutButton}
          onPress={logout}
          disabled={loading}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.neutral.lightGrey,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary.green,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  stepContainer: {
    padding: 16,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  bulletList: {
    marginTop: 16,
  },
  bulletPointContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  bulletIcon: {
    fontSize: 18,
    color: colors.text.primary,
    marginRight: 12,
    lineHeight: 24,
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 24,
  },
  bold: {
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGrey,
  },
  button: {
    backgroundColor: colors.primary.green,
    padding: 16,
    borderRadius: commonStyles.borderRadius.large,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.neutral.grey,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 16,
    padding: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: colors.text.secondary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  // New styles for multi-child UI
  childContainer: {
    backgroundColor: colors.background.secondary,
    padding: 16,
    borderRadius: commonStyles.borderRadius.medium,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.neutral.lightGrey,
  },
  childHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  childNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary.green,
  },
  removeText: {
    color: colors.accent.error,
    fontSize: 14,
  },
  addButton: {
    backgroundColor: colors.background.primary,
    padding: 16,
    alignItems: 'center',
    borderRadius: commonStyles.borderRadius.large,
    borderWidth: 1.5,
    borderColor: colors.primary.green,
    borderStyle: 'dashed',
  },
  addButtonText: {
    color: colors.primary.green,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
