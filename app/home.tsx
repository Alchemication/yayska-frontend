// app/home.tsx
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '../src/theme/colors';
import { router, useRouter } from 'expo-router';

// Temporary mock data (we'll fetch from API later)
const MOCK_CHILDREN = [
  { id: '1', name: 'Child 1', year: '3rd Class' },
  { id: '2', name: 'Child 2', year: '5th Class' },
];

const MOCK_SUBJECTS = [
  {
    id: '1',
    name: 'Mathematics',
    concepts: [
      { id: '1', name: 'Patterns with Fractions' },
      { id: '2', name: 'Number Operations' },
      { id: '3', name: 'Shape & Space' },
      { id: '4', name: 'Measures' },
      { id: '5', name: 'Data' },
    ],
  },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.welcomeText}>Welcome to Yayska!</Text>

          {/* Children Selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.childrenScroll}
          >
            {MOCK_CHILDREN.map((child) => (
              <Pressable key={child.id} style={styles.childCard}>
                <Text style={styles.childName}>{child.name}</Text>
                <Text style={styles.childYear}>{child.year}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Subjects */}
          {MOCK_SUBJECTS.map((subject) => (
            <View key={subject.id} style={styles.subjectContainer}>
              <Text style={styles.subjectTitle}>{subject.name}</Text>

              {/* concepts */}
              <View style={styles.conceptsGrid}>
                {subject.concepts.map((concept) => (
                  <Pressable
                    key={concept.id}
                    style={styles.conceptCard}
                    onPress={() => router.push(`/concept/${concept.id}`)}
                  >
                    <Text style={styles.conceptText}>{concept.name}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 20,
  },
  childrenScroll: {
    marginBottom: 24,
  },
  childCard: {
    backgroundColor: colors.primary.green,
    padding: 16,
    borderRadius: commonStyles.borderRadius.medium,
    marginRight: 12,
    minWidth: 120,
    ...commonStyles.shadow,
  },
  childName: {
    color: colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  childYear: {
    color: colors.neutral.white,
    fontSize: 14,
    opacity: 0.9,
  },
  subjectContainer: {
    marginBottom: 24,
  },
  subjectTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  conceptsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  conceptCard: {
    backgroundColor: colors.background.primary,
    padding: 16,
    borderRadius: commonStyles.borderRadius.medium,
    width: '47%', // approximately 2 columns with gap
    ...commonStyles.shadow,
  },
  conceptText: {
    fontSize: 16,
    color: colors.text.primary,
    textAlign: 'center',
  },
});
