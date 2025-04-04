import React, { useState, useEffect } from 'react';
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
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, commonStyles } from '../src/theme/colors';
import { getChildren, clearChildren, Child } from '../src/utils/storage';
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
    const savedChildren = await getChildren();
    if (savedChildren?.length) {
      setChildren(savedChildren);
      setSelectedChild(savedChildren[0]);
    } else {
      // No children found, redirect to onboarding
      router.replace('/onboarding');
    }
  };

  const loadSubjectPaths = async () => {
    if (!selectedChild?.yearId) return;

    try {
      setLoading(true);
      const data = await api.getSubjectLearningPaths(selectedChild.yearId);
      setSubjects(data);
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
    router.push(`/concept/${conceptId}`);
  };

  const toggleChildrenMenu = () => {
    setShowChildrenMenu(!showChildrenMenu);
  };

  const selectChild = (child: Child) => {
    setSelectedChild(child);
    setShowChildrenMenu(false);
  };

  const toggleSubjectExpansion = (subjectId: number) => {
    if (expandedSubjectId === subjectId) {
      setExpandedSubjectId(null);
    } else {
      setExpandedSubjectId(subjectId);
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
                        size={22}
                        color={colors.text.primary}
                      />
                    </Pressable>
                    {expandedSubjectId === subject.id && (
                      <View style={styles.conceptsContainer}>
                        {subject.concepts.map((concept) => (
                          <Pressable
                            key={concept.id}
                            onPress={() => navigateToConcept(concept.id)}
                          >
                            <LearningGoalCard concept={concept} />
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Debug reset button */}
          <View style={{ marginTop: 40 }}>
            <Pressable style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Reset All Data</Text>
            </Pressable>
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
  conceptsContainer: {
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
