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
import { useLocalSearchParams } from 'expo-router';
import { getChildren, saveChild } from '../src/utils/storage';
import {
  EDUCATION_LEVELS,
  SCHOOL_YEARS,
  getSchoolYearsByLevelId,
} from '../src/constants/education';
import { useAuth } from '../src/context/AuthContext';
import { UserProfile } from '../src/components/Auth/UserProfile';
import { ProfileAvatar } from '../src/components/Auth/ProfileAvatar';
import { trackEvent } from '../src/utils/analytics';

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
  const [showUserProfile, setShowUserProfile] = useState(false);

  // Track onboarding start
  useEffect(() => {
    trackEvent('ONBOARDING_STARTED', {
      mode: mode || 'initial',
      is_authenticated: isAuthenticated,
    });
  }, [mode, isAuthenticated]);

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
    const newChild = {
      id: `child-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      year: null,
      yearId: null,
    };

    setChildren([...children, newChild]);
  };

  const removeChild = (id: string) => {
    setChildren(children.filter((child) => child.id !== id));
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

    // Track year selection
    trackEvent('CHILD_YEAR_SELECTED', {
      year_id: yearId,
      year_name: yearName,
      mode: mode || 'initial',
    });
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
      setLoading(true);

      // Track onboarding completion attempt
      await trackEvent('ONBOARDING_COMPLETION_ATTEMPT', {
        children_count: children.length,
        mode: mode || 'initial',
        year_distribution: children.reduce((acc, child) => {
          if (child.year) {
            acc[child.year] = (acc[child.year] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>),
      });

      // Create each child via API
      for (const child of children) {
        if (child.yearId && child.name.trim()) {
          await saveChild(child.name.trim(), child.yearId);
        }
      }

      // Track successful onboarding completion
      await trackEvent('ONBOARDING_COMPLETED', {
        children_count: children.length,
        mode: mode || 'initial',
      });

      router.replace('/home');
    } catch (error) {
      console.error('Error saving children:', error);

      // Track onboarding failure
      await trackEvent('ONBOARDING_FAILED', {
        children_count: children.length,
        error: error instanceof Error ? error.message : 'Unknown error',
        mode: mode || 'initial',
      });

      Alert.alert(
        'Error',
        'Failed to save children information. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
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
            <View style={styles.headerTop}>
              <View style={styles.headerLeft}>
                <View style={styles.placeholderButton} />
                <Image
                  source={require('../assets/images/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              {isAuthenticated && (
                <Pressable
                  style={styles.profileButton}
                  onPress={() => setShowUserProfile(true)}
                >
                  <ProfileAvatar size={24} />
                </Pressable>
              )}
            </View>
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
                <Pressable
                  style={styles.removeButton}
                  onPress={() => removeChild(child.id)}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
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
            <Text style={styles.addButtonText}>+ Add Another Child</Text>
          </Pressable>

          <Pressable
            style={[
              styles.continueButton,
              (!children.every((child) => child.yearId) || loading) &&
                styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={loading || !children.every((child) => child.yearId)}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.neutral.white} />
                <Text style={[styles.continueButtonText, styles.loadingText]}>
                  Creating children...
                </Text>
              </View>
            ) : (
              <Text style={styles.continueButtonText}>Continue</Text>
            )}
          </Pressable>
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
    paddingHorizontal: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    padding: 2,
  },
  placeholderButton: {
    width: 0,
  },
  logo: {
    width: 130,
    height: 34,
    marginLeft: 2,
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
    marginBottom: 14,
    backgroundColor: colors.background.primary,
    padding: 10,
    borderRadius: commonStyles.borderRadius.medium,
    ...commonStyles.shadow,
  },
  childHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
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
    padding: 10,
    alignItems: 'center',
    marginBottom: 16,
    borderRadius: commonStyles.borderRadius.small,
    borderWidth: 1,
    borderColor: colors.primary.green,
    borderStyle: 'dashed',
  },
  addButtonText: {
    color: colors.primary.green,
    fontSize: 15,
    fontWeight: '500',
  },
  continueButton: {
    backgroundColor: colors.primary.green,
    padding: 12,
    borderRadius: commonStyles.borderRadius.medium,
    alignItems: 'center',
    marginBottom: 20,
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 8,
  },
  profileOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
