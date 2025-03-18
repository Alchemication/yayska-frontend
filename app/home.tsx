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

  const showComingSoonAlert = (feature: string) => {
    Alert.alert(
      'Coming Soon',
      `${feature} will be available in a future update!`,
      [{ text: 'OK' }]
    );
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
        {/* Compact Header with integrated child selector */}
        <View style={styles.compactHeader}>
          <Text style={styles.headerTitle}>Yayska</Text>
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
                  style={styles.childSelectorIcon}
                />
              )}
            </View>
          </Pressable>
        </View>

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
          {/* Quick Actions Row */}
          <View style={styles.quickActionsRow}>
            <Pressable
              style={styles.quickActionButton}
              onPress={navigateToExplore}
            >
              <Ionicons
                name="grid-outline"
                size={18}
                color={colors.primary.green}
              />
              <Text style={styles.quickActionText}>Explore All</Text>
            </Pressable>

            <Pressable
              style={styles.quickActionButton}
              onPress={() => showComingSoonAlert('AI Chat')}
            >
              <Ionicons
                name="chatbubble-outline"
                size={18}
                color={colors.primary.green}
              />
              <Text style={styles.quickActionText}>AI Chat</Text>
            </Pressable>

            <Pressable
              style={styles.quickActionButton}
              onPress={() => showComingSoonAlert('Progress tracking')}
            >
              <Ionicons
                name="bar-chart-outline"
                size={18}
                color={colors.primary.green}
              />
              <Text style={styles.quickActionText}>Progress</Text>
            </Pressable>
          </View>

          {/* Monthly Curriculum Carousel - directly embedded without extra header */}
          <View style={styles.carouselContainer}>
            <Text style={styles.sectionTitle}>This Month's Learning</Text>
            <MonthlyConceptsCarousel
              curriculumPlans={curriculumPlans}
              selectedYearId={selectedChild?.yearId || undefined}
              isLoading={loading}
              onViewAllConcepts={navigateToExplore}
            />
          </View>

          {/* Debug reset button - moved to bottom and made less prominent */}
          <Pressable style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset All Data</Text>
          </Pressable>
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
  compactHeader: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary.green,
  },
  childSelector: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: colors.background.tertiary,
  },
  childSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedChildName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  childSelectorIcon: {
    marginLeft: 4,
  },
  childrenMenu: {
    backgroundColor: colors.background.secondary,
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
    padding: 12,
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
    paddingBottom: 24,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.secondary,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.primary,
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.text.primary,
  },
  carouselContainer: {
    marginBottom: 8,
  },
  resetButton: {
    marginTop: 30,
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: colors.accent.error,
  },
  resetButtonText: {
    color: colors.accent.error,
    fontSize: 14,
    fontWeight: '500',
  },
});
