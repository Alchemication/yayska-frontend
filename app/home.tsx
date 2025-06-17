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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect, usePathname } from 'expo-router';
import { useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors, commonStyles } from '../src/theme/colors';
import { getChildren, Child } from '../src/utils/storage';
import { resolveActiveChild, setActiveChild } from '../src/utils/activeChild';
import { api } from '../src/services/api';
import {
  MonthlyConceptsCarousel,
  CurriculumPlan,
} from '../src/components/Learning/MonthlyConceptsCarousel';
import { getChildDisplayName } from '../src/utils/childDisplayUtils';
import { useAuth } from '../src/context/AuthContext';
import { UserProfile } from '../src/components/Auth/UserProfile';
import {
  AppHeader,
  TabNavigator,
  TabRoute,
  ChildrenDropdown,
} from '../src/components/Navigation';
import { trackEvent } from '../src/utils/analytics';

export default function HomeScreen() {
  const { user, isAuthenticated } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [curriculumLoading, setCurriculumLoading] = useState(false);
  const [showChildrenMenu, setShowChildrenMenu] = useState(false);
  const [curriculumPlans, setCurriculumPlans] = useState<CurriculumPlan[]>([]);
  const [isSummerMode, setIsSummerMode] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);

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

  const refreshChildren = useCallback(async () => {
    await loadChildren();
  }, []);

  // Track screen view and refresh data when component comes into focus
  useFocusEffect(
    useCallback(() => {
      // Removed: High-frequency event that creates noise
      // Consider tracking session-based page views instead
      // trackEvent('SCREEN_VIEW', {
      //   screen_name: 'home',
      //   child_year: selectedChild?.year,
      //   children_count: children.length,
      // });

      // Refresh children data
      refreshChildren();
    }, [refreshChildren])
  );

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      setLoading(true);
      const savedChildren = await getChildren();
      if (savedChildren.length > 0) {
        setChildren(savedChildren);

        // Use active child resolution with persistence
        const activeChild = await resolveActiveChild(savedChildren);
        setSelectedChild(activeChild);
      } else {
        // No children found, redirect to onboarding
        router.replace('/onboarding');
      }
    } catch (error) {
      console.error('Error loading children:', error);
      Alert.alert('Error', 'Failed to load children. Please try again.', [
        { text: 'OK' },
      ]);
      router.replace('/onboarding');
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlyCurriculum = async (yearIds: number[]) => {
    try {
      setCurriculumLoading(true);
      const data = await api.getMonthlyCurriculum(yearIds);
      setCurriculumPlans(data.curriculum_plans);
      setIsSummerMode(data.is_summer_mode);

      // Track curriculum loaded
      await trackEvent('CURRICULUM_LOADED', {
        year_ids: yearIds,
        is_summer_mode: data.is_summer_mode,
        plans_count: data.curriculum_plans.length,
      });
    } catch (error) {
      console.error('Error loading monthly curriculum:', error);
    } finally {
      setCurriculumLoading(false);
    }
  };

  const navigateToExplore = () => {
    // Track navigation to explore
    trackEvent('NAVIGATION', {
      from_screen: 'home',
      to_screen: 'explore',
      trigger: 'view_all_concepts',
      child_year: selectedChild?.year,
    });

    router.push('/explore');
  };

  const toggleChildrenMenu = () => {
    setShowChildrenMenu(!showChildrenMenu);
  };

  const selectChild = async (child: Child) => {
    const previousChild = selectedChild;

    setSelectedChild(child);
    setShowChildrenMenu(false);

    // Track child switch
    await trackEvent('CHILD_SWITCHED', {
      from_child_year: previousChild?.year,
      to_child_year: child.year,
      children_count: children.length,
      screen: 'home',
    });

    // Persist the active child selection
    try {
      await setActiveChild(child);
    } catch (error) {
      console.error('Error setting active child:', error);
    }
  };

  const toggleUserProfile = () => {
    setShowUserProfile(!showUserProfile);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background.primary }}
    >
      <View style={styles.container}>
        <AppHeader
          children={children}
          selectedChild={selectedChild}
          showChildrenMenu={showChildrenMenu}
          toggleChildrenMenu={toggleChildrenMenu}
          selectChild={selectChild}
          toggleUserProfile={toggleUserProfile}
        />

        {/* Main content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Monthly Curriculum Carousel - directly embedded without extra header */}
          <View style={styles.carouselContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>This Month's Learning</Text>
              <Pressable
                style={styles.viewAllButton}
                onPress={navigateToExplore}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <Ionicons
                  name="arrow-forward"
                  size={14}
                  color={colors.primary.green}
                />
              </Pressable>
            </View>
            <MonthlyConceptsCarousel
              curriculumPlans={curriculumPlans}
              selectedYearId={selectedChild?.yearId || undefined}
              isLoading={loading || curriculumLoading}
              onViewAllConcepts={navigateToExplore}
            />
          </View>
        </ScrollView>

        {/* User Profile Popover */}
        {showUserProfile && (
          <View style={styles.profileOverlay}>
            <UserProfile
              isVisible={showUserProfile}
              onClose={() => setShowUserProfile(false)}
            />
          </View>
        )}

        <TabNavigator activeTab={TabRoute.Home} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 80, // Extra padding at the bottom for the tab bar
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary.green,
    fontWeight: '500',
    marginRight: 4,
  },
  carouselContainer: {
    marginBottom: 8,
  },
  profileOverlay: {
    position: 'absolute',
    top: 60,
    right: 16,
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
});
