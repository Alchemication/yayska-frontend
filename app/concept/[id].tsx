// app/concept/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, ScrollView, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { ConceptDetailCard } from '../../src/components/Concept/ConceptDetailCard';
import { colors } from '../../src/theme/colors';
import { api } from '../../src/services/api';
import { ConceptMetadata } from '../../src/types/concept';

export default function ConceptDetailScreen() {
  const { id } = useLocalSearchParams();
  const [activeSection, setActiveSection] = useState('why');
  const [concept, setConcept] = useState<ConceptMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConcept = async () => {
      try {
        setLoading(true);
        const data = await api.getConceptMetadata(Number(id));
        setConcept(data as ConceptMetadata);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load concept');
      } finally {
        setLoading(false);
      }
    };

    loadConcept();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary.green} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>{concept?.concept_name}</Text>
        <ConceptDetailCard
          concept={concept}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      </ScrollView>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    padding: 20,
    textAlign: 'center',
  },
  errorText: {
    color: colors.accent.error,
    textAlign: 'center',
    padding: 20,
  },
});
