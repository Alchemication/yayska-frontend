// app/home.tsx
import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, commonStyles } from '../src/theme/colors';
import { getChildren, clearChildren, Child } from '../src/utils/storage';
import { api } from '../src/services/api';
import {
  MonthlyConceptsCarousel,
  CurriculumPlan,
} from '../src/components/Learning/MonthlyConceptsCarousel';
import { updateChildrenWithYearNames } from '../src/utils/educationUtils';
import { getChildDisplayName } from '../src/utils/childDisplayUtils';

export default function HomeScreen() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChildrenMenu, setShowChildrenMenu] = useState(false);
  const [curriculumPlans, setCurriculumPlans] = useState<CurriculumPlan[]>([]);
  const [isSummerMode, setIsSummerMode] = useState(false);

  useEffect(() => {
    updateChildrenWithYearNames();
    loadChildren();
  }, []);

  useEffect(() => {
    if (children.length > 0) {
      // Get year IDs for all children
      const yearIds = children
        .map((child) => child.yearId)
        .filter(Boolean) as number[];
      if (yearIds.length > 0) {
        loadMonthlyCurriculum(yearIds);
      }
    }
  }, [children]);

  const loadChildren = async () => {
    const savedChildren = await getChildren();
    if (savedChildren?.length) {
      setChildren(savedChildren);
      setSelectedChild(savedChildren[0]);
    } else {
      // No children found, redirect to onboarding
      router.replace('/onboarding');
    }
  };

  const loadMonthlyCurriculum = async (yearIds: number[]) => {
    try {
      setLoading(true);
      const response = await api.getMonthlyCurriculum(yearIds);
      setCurriculumPlans(response.curriculum_plans);
      setIsSummerMode(response.is_summer_mode);
    } catch (error) {
      console.error('Error loading monthly curriculum:', error);
      Alert.alert(
        'Error',
        'Failed to load monthly curriculum. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    console.log('Reset clicked');

    const performReset = () => {
      console.log('Reset confirmed');
      // First clear the local state
      setChildren([]);
      setSelectedChild(null);
      setShowChildrenMenu(false);

      // Then clear storage and navigate
      clearChildren()
        .then(() => {
          console.log('Storage cleared, navigating...');
          router.replace('/');
        })
        .catch((error) => {
          console.error('Reset error:', error);
          if (Platform.OS === 'web') {
            window.alert('Failed to reset. Please try again.');
          } else {
            Alert.alert('Error', 'Failed to reset. Please try again.', [
              { text: 'OK' },
            ]);
          }
        });
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to reset?')) {
        performReset();
      }
    } else {
      Alert.alert(
        'Confirm Reset',
        'This will clear all your data and return to the welcome screen. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Reset', onPress: performReset, style: 'destructive' },
        ]
      );
    }
  };

  const navigateToExplore = () => {
    router.push('/explore' as any);
  };

  const toggleChildrenMenu = () => {
    setShowChildrenMenu(!showChildrenMenu);
  };

  const selectChild = (child: Child) => {
    setSelectedChild(child);
    setShowChildrenMenu(false);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background.primary }}
    >
      <View style={styles.container}>
        {/* Header with title */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Yayska</Text>
        </View>

        {/* Child selector with school year */}
        <Pressable
          style={styles.childSelector}
          onPress={toggleChildrenMenu}
          disabled={children.length <= 1}
        >
          <View style={styles.childSelectorContent}>
            <Text style={styles.selectedChildName}>
              {getChildDisplayName(selectedChild)}
            </Text>
            {children.length > 1 && (
              <Ionicons
                name={showChildrenMenu ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.text.primary}
              />
            )}
          </View>
        </Pressable>

        {/* Children dropdown */}
        {showChildrenMenu && (
          <View style={styles.childrenMenu}>
            {children.map((child) => (
              <Pressable
                key={child.id}
                style={styles.childMenuItem}
                onPress={() => selectChild(child)}
              >
                <Text
                  style={[
                    styles.childMenuItemText,
                    selectedChild?.id === child.id && styles.selectedChildText,
                  ]}
                >
                  {child.name}
                  {child.year && <Text> ({child.year})</Text>}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Main content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Monthly Curriculum Carousel - simplified header */}
          <MonthlyConceptsCarousel
            curriculumPlans={curriculumPlans}
            selectedYearId={selectedChild?.yearId || undefined}
            isLoading={loading}
            onViewAllConcepts={navigateToExplore}
          />

          {/* Explore All Card */}
          <Pressable style={styles.exploreCard} onPress={navigateToExplore}>
            <View style={styles.exploreCardContent}>
              <View>
                <Text style={styles.exploreCardTitle}>
                  Explore All Subjects
                </Text>
                <Text style={styles.exploreCardSubtitle}>
                  Browse the complete curriculum by subject
                </Text>
              </View>
              <Ionicons
                name="chevron-forward-circle"
                size={32}
                color={colors.primary.green}
              />
            </View>
          </Pressable>

          {/* Debug reset button */}
          <View style={{ marginTop: 40 }}>
            <Pressable style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Reset All Data</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    backgroundColor: colors.background.secondary,
    padding: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary.green,
  },
  childSelector: {
    backgroundColor: colors.background.secondary,
    padding: 16,
    marginBottom: 1,
  },
  childSelectorContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedChildName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  yearText: {
    fontWeight: '400',
    color: colors.text.secondary,
  },
  childrenMenu: {
    backgroundColor: colors.background.secondary,
    marginBottom: 16,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  childMenuItem: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
  },
  childMenuItemText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  selectedChildText: {
    fontWeight: '600',
    color: colors.primary.green,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  exploreCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  exploreCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exploreCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: colors.text.primary,
  },
  exploreCardSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  resetButton: {
    backgroundColor: colors.accent.error,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
  },
  resetButtonText: {
    color: colors.background.primary,
    fontWeight: '600',
  },
});
