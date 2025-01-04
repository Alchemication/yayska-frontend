// app/home.tsx
import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '../src/theme/colors';
import { getChildren, Child } from '../src/utils/storage';
import { api } from '../src/services/api';
import { SubjectLearningPath } from '../src/types/curriculum';
import { LearningGoalCard } from '../src/components/Learning/LearningGoalCard';

export default function HomeScreen() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [subjects, setSubjects] = useState<SubjectLearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      // You might want to show an error message to the user
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSubjectPaths();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Children Selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.childrenScroll}
          >
            {children.map((child) => (
              <Pressable
                key={child.id}
                style={[
                  styles.childCard,
                  selectedChild?.id === child.id && styles.selectedChildCard,
                ]}
                onPress={() => setSelectedChild(child)}
              >
                <Text style={styles.childName}>{child.name}</Text>
                <Text style={styles.childYear}>{child.year}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary.green} />
            </View>
          ) : (
            subjects.map((subject) => (
              <View key={subject.id} style={styles.subjectSection}>
                <Text style={styles.subjectTitle}>{subject.subject_name}</Text>
                {Object.values(subject.learning_goals)
                  .sort((a, b) => a.complexity_level - b.complexity_level)
                  .map((goal) => (
                    <LearningGoalCard key={goal.id} goal={goal} />
                  ))}
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
  scrollContent: {
    padding: 20,
  },
  childrenScroll: {
    marginBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  childCard: {
    backgroundColor: colors.background.primary,
    padding: 16,
    borderRadius: commonStyles.borderRadius.medium,
    marginRight: 12,
    minWidth: 120,
    ...commonStyles.shadow,
  },
  selectedChildCard: {
    backgroundColor: colors.primary.green,
  },
  childName: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  childYear: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  subjectSection: {
    marginBottom: 24,
  },
  subjectTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
  },
});
