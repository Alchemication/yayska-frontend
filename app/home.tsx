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
import { LearningGoalCard } from '../src/components/Learning/LearningGoalCard';
import { api } from '../src/services/api';
import { SubjectLearningPath, ConceptInPath } from '../src/types/curriculum';

export default function HomeScreen() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [subjects, setSubjects] = useState<SubjectLearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChildrenMenu, setShowChildrenMenu] = useState(false);
  const [expandedSubjectId, setExpandedSubjectId] = useState<number | null>(
    null
  );

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
      if (
        window.confirm(
          'This will clear all saved data and return to the welcome screen. Are you sure?'
        )
      ) {
        performReset();
      }
    } else {
      Alert.alert(
        'Start Over',
        'This will clear all saved data and return to the welcome screen. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Start Over',
            style: 'destructive',
            onPress: performReset,
          },
        ]
      );
    }
  };

  const handleAddChild = () => {
    router.push('/onboarding?mode=add');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.welcomeText}>
              {selectedChild?.name
                ? `${selectedChild.name}'s Learning`
                : 'Welcome to Yayska!'}
            </Text>
            <Text style={styles.yearText}>{selectedChild?.year || ''}</Text>
          </View>
          <Pressable
            style={styles.menuButton}
            onPress={() => setShowChildrenMenu(!showChildrenMenu)}
          >
            <Ionicons
              name={showChildrenMenu ? 'close' : 'menu'}
              size={24}
              color={colors.text.primary}
            />
          </Pressable>
        </View>

        {/* Children Menu */}
        {showChildrenMenu && (
          <View style={styles.menuCard}>
            <Text style={styles.menuTitle}>Children</Text>
            {children.map((child) => {
              const isSelected = selectedChild?.id === child.id;
              return (
                <Pressable
                  key={`menu-child-${child.id}`} // Updated key to ensure uniqueness
                  style={[
                    styles.menuItem,
                    isSelected && styles.menuItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedChild(child);
                    setShowChildrenMenu(false);
                  }}
                >
                  <Text
                    style={[
                      styles.menuItemText,
                      isSelected && styles.menuItemTextSelected,
                    ]}
                  >
                    {child.name || 'Unnamed Child'} ({child.year})
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              style={[styles.menuItem, styles.menuItemAction]}
              onPress={handleAddChild}
            >
              <Text style={styles.menuItemActionText}>+ Add Another Child</Text>
            </Pressable>
            <Pressable
              style={[styles.menuItem, styles.menuItemAction]}
              onPress={handleReset}
            >
              <Text
                style={[
                  styles.menuItemActionText,
                  styles.menuItemActionDestructive,
                ]}
              >
                Start Over
              </Text>
            </Pressable>
          </View>
        )}

        {/* Main Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary.green} />
            </View>
          ) : (
            subjects.map((subject) => (
              <View key={subject.id} style={styles.subjectSection}>
                <Pressable
                  style={styles.subjectHeader}
                  onPress={() =>
                    setExpandedSubjectId(
                      expandedSubjectId === subject.id ? null : subject.id
                    )
                  }
                >
                  <Text style={styles.subjectTitle}>{subject.name}</Text>
                  <View style={styles.subjectStats}>
                    <Text style={styles.subjectStatsText}>
                      {subject.concepts.length} concepts
                    </Text>
                    <Ionicons
                      name={
                        expandedSubjectId === subject.id
                          ? 'chevron-up'
                          : 'chevron-down'
                      }
                      size={24}
                      color={colors.text.secondary}
                    />
                  </View>
                </Pressable>

                {expandedSubjectId === subject.id && (
                  <View style={styles.conceptsList}>
                    {subject.concepts
                      .sort((a, b) => a.display_order - b.display_order)
                      .map((concept) => (
                        <LearningGoalCard key={concept.id} concept={concept} />
                      ))}
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background.primary,
    ...commonStyles.shadow,
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  yearText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  menuButton: {
    padding: 8,
    marginLeft: 16,
  },
  menuCard: {
    position: 'absolute',
    top: 84, // Below header
    right: 20,
    backgroundColor: colors.background.primary,
    borderRadius: commonStyles.borderRadius.medium,
    padding: 8,
    width: 250,
    zIndex: 1000,
    ...commonStyles.shadow,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    padding: 8,
    marginBottom: 4,
  },
  menuItem: {
    padding: 12,
    borderRadius: commonStyles.borderRadius.small,
  },
  menuItemSelected: {
    backgroundColor: colors.primary.green,
  },
  menuItemText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  menuItemTextSelected: {
    color: colors.neutral.white,
    fontWeight: '500',
  },
  menuItemAction: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGrey,
    marginTop: 4,
  },
  menuItemActionText: {
    color: colors.primary.green,
    fontSize: 14,
    fontWeight: '500',
  },
  menuItemActionDestructive: {
    color: colors.accent.error,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  subjectSection: {
    marginBottom: 16,
    backgroundColor: colors.background.primary,
    borderRadius: commonStyles.borderRadius.medium,
    ...commonStyles.shadow,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  subjectTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  subjectStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subjectStatsText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  conceptsList: {
    padding: 16,
    paddingTop: 0,
  },
});
