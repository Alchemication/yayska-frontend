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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, commonStyles } from '../src/theme/colors';
import { LearningGoalCard } from '../src/components/Learning/LearningGoalCard';
import { api } from '../src/services/api';
import { SubjectLearningPath, ConceptInPath } from '../src/types/curriculum';
import { useAuth } from '../src/context/AuthContext';
import { UserProfile } from '../src/components/Auth/UserProfile';
import {
  AppHeader,
  TabNavigator,
  TabRoute,
} from '../src/components/Navigation';
import { trackEvent } from '../src/utils/analytics';
import { getSubjectColor } from '../src/utils/subjects/subjectColors';
import { useAppHeader } from '../src/hooks/useAppHeader';

// Let's first check what props the LearningGoalCard expects
interface ConceptCardProps {
  concept: ConceptInPath;
  onPress?: () => void;
}

export default function ExploreScreen() {
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
  const [subjects, setSubjects] = useState<SubjectLearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSubjectId, setExpandedSubjectId] = useState<number | null>(
    null
  );
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (selectedChild?.yearId) {
      loadSubjectPaths();
    }
  }, [selectedChild]);

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

  const toggleSubjectExpansion = (subjectId: number) => {
    const wasExpanded = expandedSubjectId === subjectId;
    const subject = subjects.find((s) => s.id === subjectId);

    if (wasExpanded) {
      setExpandedSubjectId(null);
    } else {
      setExpandedSubjectId(subjectId);
      trackEvent('SUBJECT_EXPANDED', {
        subject_id: subjectId,
        subject_name: subject?.name,
        concepts_count: subject?.concepts.length,
        child_year: selectedChild?.year,
      });
    }
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
          contentContainerStyle={styles.content}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary.green} />
              <Text style={styles.loadingText}>Loading content...</Text>
            </View>
          ) : (
            <>
              <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Explore the Curriculum</Text>
                <Text style={styles.headerSubtitle}>
                  Select a subject to see the key concepts your child will be
                  learning this year.
                </Text>
              </View>
              <View style={styles.content}>
                {subjects.map((subject) => (
                  <View
                    key={subject.id}
                    style={[
                      styles.subjectSection,
                      {
                        borderLeftColor: getSubjectColor(subject.name),
                        borderLeftWidth: 4,
                      },
                    ]}
                  >
                    <Pressable
                      style={styles.subjectHeader}
                      onPress={() => toggleSubjectExpansion(subject.id)}
                    >
                      <Text style={styles.subjectTitle}>{subject.name}</Text>
                      <View style={styles.subjectHeaderRight}>
                        <Text style={styles.conceptCount}>
                          {subject.concepts.length} concepts
                        </Text>
                        <Ionicons
                          name={
                            expandedSubjectId === subject.id
                              ? 'chevron-up'
                              : 'chevron-down'
                          }
                          size={20}
                          color={colors.text.secondary}
                        />
                      </View>
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
            </>
          )}
        </ScrollView>
        {showUserProfile && (
          <View style={styles.profileOverlay}>
            <UserProfile
              isVisible={showUserProfile}
              onClose={toggleUserProfile}
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
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  headerContainer: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
  },
  subjectSection: {
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  subjectHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  conceptCount: {
    fontSize: 14,
    color: colors.text.secondary,
    marginRight: 8,
  },
  conceptsList: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGrey,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text.secondary,
  },
  profileOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
});
