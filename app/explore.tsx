import React, { useState, useEffect, useCallback } from 'react';
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
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, commonStyles } from '../src/theme/colors';
import { getChildren, clearChildren, Child } from '../src/utils/storage';
import { resolveActiveChild, setActiveChild } from '../src/utils/activeChild';
import { LearningGoalCard } from '../src/components/Learning/LearningGoalCard';
import { api } from '../src/services/api';
import { SubjectLearningPath, ConceptInPath } from '../src/types/curriculum';
import { useAuth } from '../src/context/AuthContext';
import { UserProfile } from '../src/components/Auth/UserProfile';
import {
  AppHeader,
  TabNavigator,
  TabRoute,
  ChildrenDropdown,
} from '../src/components/Navigation';
import { trackEvent } from '../src/utils/analytics';

// Let's first check what props the LearningGoalCard expects
interface ConceptCardProps {
  concept: ConceptInPath;
  onPress?: () => void;
}

export default function ExploreScreen() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [subjects, setSubjects] = useState<SubjectLearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChildrenMenu, setShowChildrenMenu] = useState(false);
  const [expandedSubjectId, setExpandedSubjectId] = useState<number | null>(
    null
  );
  const [showUserProfile, setShowUserProfile] = useState(false);

  // Add useAuth hook to get authentication state
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedChild?.yearId) {
      loadSubjectPaths();
    }
  }, [selectedChild]);

  const loadChildren = async () => {
    try {
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
      router.replace('/onboarding');
    }
  };

  const loadSubjectPaths = async () => {
    if (!selectedChild?.yearId) return;

    try {
      setLoading(true);
      const data = await api.getSubjectLearningPaths(selectedChild.yearId);
      setSubjects(data);

      // Removed: Technical loading event, not user behavior
      // await trackEvent('LEARNING_PATHS_LOADED', {
      //   child_year: selectedChild.year,
      //   subjects_count: data.length,
      //   total_concepts: data.reduce(
      //     (sum, subject) => sum + subject.concepts.length,
      //     0
      //   ),
      // });
    } catch (error) {
      console.error('Error loading learning paths:', error);
      Alert.alert(
        'Error',
        'Failed to load learning content. Please try again.',
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
          router.replace('/onboarding');
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

  const navigateToConcept = (conceptId: number) => {
    const concept = subjects
      .flatMap((subject) => subject.concepts)
      .find((c) => c.id === conceptId);

    // Track concept click
    trackEvent('CONCEPT_CLICKED', {
      concept_id: conceptId,
      concept_name: concept?.name,
      subject_name: subjects.find((s) =>
        s.concepts.some((c) => c.id === conceptId)
      )?.name,
      child_year: selectedChild?.year,
      source_screen: 'explore',
      complexity: concept?.complexity,
    });

    router.push(`/concept/${conceptId}`);
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
      screen: 'explore',
    });

    // Persist the active child selection
    try {
      await setActiveChild(child);
    } catch (error) {
      console.error('Error setting active child:', error);
    }
  };

  const toggleSubjectExpansion = (subjectId: number) => {
    const wasExpanded = expandedSubjectId === subjectId;
    const subject = subjects.find((s) => s.id === subjectId);

    if (wasExpanded) {
      setExpandedSubjectId(null);
    } else {
      setExpandedSubjectId(subjectId);

      // Track subject expansion
      trackEvent('SUBJECT_EXPANDED', {
        subject_id: subjectId,
        subject_name: subject?.name,
        concepts_count: subject?.concepts.length,
        child_year: selectedChild?.year,
      });
    }
  };

  const toggleUserProfile = () => {
    setShowUserProfile(!showUserProfile);
  };

  const refreshChildren = useCallback(async () => {
    await loadChildren();
  }, []);

  // Track screen view and refresh data when component comes into focus
  useFocusEffect(
    useCallback(() => {
      // Removed: High-frequency event that creates noise
      // Consider tracking session-based page views instead
      // trackEvent('SCREEN_VIEW', {
      //   screen_name: 'explore',
      //   child_year: selectedChild?.year,
      //   children_count: children.length,
      //   subjects_count: subjects.length,
      // });

      // Refresh children data
      refreshChildren();
    }, [refreshChildren])
  );

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
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary.green} />
              <Text style={styles.loadingText}>Loading content...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Subjects</Text>
              <View style={styles.subjectsContainer}>
                {subjects.map((subject) => (
                  <View key={subject.id} style={styles.subjectCard}>
                    <Pressable
                      style={styles.subjectHeader}
                      onPress={() => toggleSubjectExpansion(subject.id)}
                    >
                      <Text style={styles.subjectTitle}>{subject.name}</Text>
                      <Ionicons
                        name={
                          expandedSubjectId === subject.id
                            ? 'chevron-up'
                            : 'chevron-down'
                        }
                        size={20}
                        color={colors.text.secondary}
                      />
                    </Pressable>

                    {expandedSubjectId === subject.id && (
                      <View style={styles.conceptsList}>
                        {subject.concepts.map((concept) => (
                          <LearningGoalCard
                            key={concept.id}
                            concept={concept}
                          />
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>

              {/* Debug reset button - moved to bottom and made less prominent */}
              <Pressable style={styles.resetButton} onPress={handleReset}>
                <Text style={styles.resetButtonText}>Reset All Data</Text>
              </Pressable>
            </>
          )}
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

        <TabNavigator activeTab={TabRoute.Explore} />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    color: colors.text.primary,
  },
  subjectsContainer: {
    gap: 16,
  },
  subjectCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    overflow: 'hidden',
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
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  subjectTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  conceptsList: {
    padding: 16,
    paddingTop: 0,
    gap: 16,
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
