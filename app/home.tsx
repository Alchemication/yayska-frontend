// app/home.tsx
import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, commonStyles } from '../src/theme/colors';
import { api } from '../src/services/api';
import {
  MonthlyConceptsCarousel,
  CurriculumPlan,
} from '../src/components/Learning/MonthlyConceptsCarousel';
import { useAuth } from '../src/context/AuthContext';
import { UserProfile } from '../src/components/Auth/UserProfile';
import {
  AppHeader,
  TabNavigator,
  TabRoute,
} from '../src/components/Navigation';
import { trackEvent } from '../src/utils/analytics';
import { useAppHeader } from '../src/hooks/useAppHeader';

export default function HomeScreen() {
  const { user, isAuthenticated } = useAuth();
  const {
    children,
    selectedChild,
    showChildrenMenu,
    showUserProfile,
    loading: headerLoading,
    toggleChildrenMenu,
    selectChild,
    toggleUserProfile,
  } = useAppHeader();
  const [curriculumLoading, setCurriculumLoading] = useState(false);
  const [curriculumPlans, setCurriculumPlans] = useState<CurriculumPlan[]>([]);
  const [isSummerMode, setIsSummerMode] = useState(false);

  useEffect(() => {
    if (children && children.length > 0) {
      const yearIds = children
        .map((child) => child.yearId)
        .filter(Boolean) as number[];
      if (yearIds.length > 0) {
        loadMonthlyCurriculum(yearIds);
      }
    }
  }, [children]);

  const loadMonthlyCurriculum = async (yearIds: number[]) => {
    try {
      setCurriculumLoading(true);
      const data = await api.getMonthlyCurriculum(yearIds);
      setCurriculumPlans(data.curriculum_plans);
      setIsSummerMode(data.is_summer_mode);

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
    trackEvent('NAVIGATION', {
      from_screen: 'home',
      to_screen: 'explore',
      trigger: 'view_all_concepts',
      child_year: selectedChild?.year,
    });

    router.push('/explore');
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
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
        >
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
              isLoading={headerLoading || curriculumLoading}
              onViewAllConcepts={navigateToExplore}
            />
          </View>
        </ScrollView>
        {showUserProfile && (
          <View style={styles.profileOverlay}>
            <UserProfile
              isVisible={showUserProfile}
              onClose={() => toggleUserProfile()}
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
    paddingBottom: 80,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary.green,
    marginRight: 4,
    fontWeight: '500',
  },
  carouselContainer: {
    marginBottom: 24,
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
