// app/home.tsx
import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, commonStyles } from '../src/theme/colors';
import { getChildren, clearChildren, Child } from '../src/utils/storage';
import { ConceptPreviewCard } from '../src/components/Concept/ConceptPreviewCard';
import { api } from '../src/services/api';
import { Subject, Topic, Concept } from '../src/types/curriculum';

export default function HomeScreen() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChildren = async () => {
      const savedChildren = await getChildren();
      if (savedChildren) {
        setChildren(savedChildren);
        if (savedChildren.length > 0) {
          setSelectedChild(savedChildren[0]);
        }
      }
    };
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedChild?.yearId) {
      loadSubjects(selectedChild.yearId);
    }
  }, [selectedChild]);

  useEffect(() => {
    if (selectedSubject) {
      loadTopics(selectedSubject.id);
    }
  }, [selectedSubject]);

  const loadSubjects = async (yearId: number) => {
    try {
      setLoading(true);
      const data = await api.getSubjects(yearId);
      setSubjects(data);
    } catch (error) {
      console.error('Error loading subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTopics = async (subjectId: number) => {
    try {
      setLoading(true);
      const data = await api.getSubjectTopics(subjectId);
      setTopics(data);
    } catch (error) {
      console.error('Error loading topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConcepts = async (topicId: number) => {
    if (!selectedChild?.yearId) return;
    try {
      setLoading(true);
      const data = await api.getTopicConcepts(
        topicId,
        Number(selectedChild.yearId)
      );
      setConcepts(data);
    } catch (error) {
      console.error('Error loading concepts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    const confirmed = window.confirm(
      'This will clear all saved data and return to the welcome screen. Are you sure?'
    );

    if (confirmed) {
      try {
        await clearChildren();
        router.replace('/');
      } catch (error) {
        console.error('Error during reset:', error);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome to Yayska!</Text>
          <Pressable style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Children Selector */}
          <Text style={styles.sectionTitle}>Select Child</Text>
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
            <ActivityIndicator size="large" color={colors.primary.green} />
          ) : (
            <>
              {/* Subjects Grid */}
              {!selectedSubject ? (
                <View style={styles.subjectsGrid}>
                  <Text style={styles.sectionTitle}>Select Subject</Text>
                  {subjects.map((subject) => (
                    <Pressable
                      key={subject.id}
                      style={styles.subjectCard}
                      onPress={() => setSelectedSubject(subject)}
                    >
                      <Text style={styles.subjectName}>
                        {subject.subject_name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <>
                  {/* Topics Grid */}
                  {!selectedTopic ? (
                    <>
                      <View style={styles.navigationHeader}>
                        <Pressable
                          style={styles.backButton}
                          onPress={() => setSelectedSubject(null)}
                        >
                          <Text style={styles.backButtonText}>
                            ← All Subjects
                          </Text>
                        </Pressable>
                        <Text style={styles.subjectTitle}>
                          {selectedSubject.subject_name}
                        </Text>
                      </View>

                      <View style={styles.topicsGrid}>
                        {topics.map((topic) => (
                          <Pressable
                            key={topic.id}
                            style={styles.topicCard}
                            onPress={() => {
                              setSelectedTopic(topic);
                              loadConcepts(topic.id);
                            }}
                          >
                            <Text style={styles.topicName}>
                              {topic.strand_name}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </>
                  ) : (
                    /* Concepts List */
                    <View style={styles.conceptsList}>
                      <View style={styles.navigationHeader}>
                        <Pressable
                          style={styles.backButton}
                          onPress={() => setSelectedTopic(null)}
                        >
                          <Text style={styles.backButtonText}>
                            ← {selectedSubject.subject_name} Topics
                          </Text>
                        </Pressable>
                        <Text style={styles.topicTitle}>
                          {selectedTopic.strand_name}
                        </Text>
                      </View>

                      {concepts.map((concept) => (
                        <ConceptPreviewCard
                          key={concept.id}
                          concept={concept}
                          onPress={() => router.push(`/concept/${concept.id}`)}
                        />
                      ))}

                      {concepts.length === 0 && (
                        <View style={styles.emptyState}>
                          <Text style={styles.emptyStateText}>
                            No concepts available for this topic yet.
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </>
              )}
            </>
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
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  resetButton: {
    backgroundColor: colors.accent.error,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: commonStyles.borderRadius.medium,
  },
  resetButtonText: {
    color: colors.neutral.white,
    fontSize: 14,
    fontWeight: '600',
  },
  childrenScroll: {
    marginBottom: 24,
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
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 12,
  },
  backButtonText: {
    color: colors.primary.green,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  subjectTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  topicTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  subjectCard: {
    backgroundColor: colors.background.primary,
    padding: 16,
    borderRadius: commonStyles.borderRadius.medium,
    width: '47%',
    alignItems: 'center',
    ...commonStyles.shadow,
  },
  subjectIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  subjectName: {
    fontSize: 16,
    color: colors.text.primary,
    textAlign: 'center',
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  topicCard: {
    backgroundColor: colors.background.primary,
    padding: 16,
    borderRadius: commonStyles.borderRadius.medium,
    width: '47%',
    ...commonStyles.shadow,
  },
  topicName: {
    fontSize: 16,
    color: colors.text.primary,
    textAlign: 'center',
  },
  conceptsList: {
    marginTop: 12,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    color: colors.text.secondary,
    fontSize: 16,
    textAlign: 'center',
  },
});
