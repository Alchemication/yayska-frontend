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
import { EnhancedConceptCard } from '../src/components/Learning/EnhancedConceptCard';
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
import { crossPlatformAlert } from '../src/utils/crossPlatformAlert';

// Progress indicator component for subjects
const SubjectProgressIndicator = ({
  studied,
  discussed,
  total,
  onInfoPress,
}: {
  studied: number;
  discussed: number;
  total: number;
  onInfoPress: () => void;
}) => {
  return (
    <View style={styles.progressContainer}>
      <Ionicons
        name="book"
        size={14}
        color={studied > 0 ? colors.accent.success : colors.text.tertiary}
        style={styles.progressIcon}
      />
      <Text
        style={[
          styles.progressText,
          { color: studied > 0 ? colors.accent.success : colors.text.tertiary },
        ]}
      >
        {studied}
      </Text>

      <Ionicons
        name="chatbubble"
        size={14}
        color={discussed > 0 ? colors.primary.orange : colors.text.tertiary}
        style={styles.progressIcon}
      />
      <Text
        style={[
          styles.progressText,
          {
            color: discussed > 0 ? colors.primary.orange : colors.text.tertiary,
          },
        ]}
      >
        {discussed}
      </Text>

      <Text style={styles.totalText}>/ {total}</Text>

      <Pressable onPress={onInfoPress} style={styles.infoIcon}>
        <Ionicons
          name="information-circle-outline"
          size={20}
          color={colors.text.tertiary}
        />
      </Pressable>
    </View>
  );
};

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
      console.log(
        '[ExploreScreen] Loading subject paths for child:',
        selectedChild.name,
        'Year:',
        selectedChild.year
      );
      loadSubjectPaths();
    }
  }, [selectedChild?.yearId]); // Only depend on yearId, not the entire selectedChild object

  const loadSubjectPaths = async () => {
    if (!selectedChild?.yearId) return;

    try {
      setLoading(true);
      console.log(
        '[ExploreScreen] Calling API: getSubjectLearningPaths for yearId:',
        selectedChild.yearId
      );
      const data = await api.getSubjectLearningPaths(selectedChild.yearId);
      setSubjects(data);
      console.log(
        '[ExploreScreen] Successfully loaded',
        data.length,
        'subjects'
      );
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

  const calculateSubjectProgress = (concepts: ConceptInPath[]) => {
    const studied = concepts.filter((c) => c.previously_studied).length;
    const discussed = concepts.filter((c) => c.previously_discussed).length;
    const total = concepts.length;
    return { studied, discussed, total };
  };

  const showIconLegend = () => {
    crossPlatformAlert(
      'Progress Icons',
      '📖: Indicates concepts you have studied for at least 15 seconds.\n\n💬: Indicates concepts you have discussed with Yayska.'
    );
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
          showBackButton={true}
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
                  Select a subject to see all the concepts your child will be
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
                      <View style={styles.subjectHeaderLeft}>
                        <Text style={styles.subjectTitle}>{subject.name}</Text>
                        <View style={styles.subjectMeta}>
                          <Text style={styles.conceptCount}>
                            {subject.concepts.length} concepts
                          </Text>
                          <SubjectProgressIndicator
                            {...calculateSubjectProgress(subject.concepts)}
                            onInfoPress={showIconLegend}
                          />
                        </View>
                      </View>
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
                          <EnhancedConceptCard
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
  subjectHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  subjectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  subjectTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  conceptCount: {
    fontSize: 12,
    color: colors.text.secondary,
    marginRight: 12,
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
  // Progress indicator styles
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressIcon: {
    marginRight: 2,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 10,
  },
  totalText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  infoIcon: {
    marginLeft: 6,
  },
});
