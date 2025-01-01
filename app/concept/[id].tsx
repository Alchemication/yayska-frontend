// app/concept/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { ConceptDetailCard } from '../../src/components/Concept/ConceptDetailCard';
import { colors } from '../../src/theme/colors';

// Mock data (we'll fetch from API later)
const MOCK_CONCEPT = {
  title: 'Patterns with Fractions and Decimals',
  why_important: {
    practical_value:
      'Helps with recipe scaling and financial calculations, like working out discounts in Penneys or SuperValu where you might see both fractions and decimals.',
    future_learning:
      'Essential foundation for algebra and ratio problems in secondary school.',
    modern_relevance:
      'While calculators can convert between forms, understanding these patterns helps with quick mental estimates.',
  },
  difficulty_stats: {
    challenge_rate: 8,
    common_barriers: [
      'Confusion when switching between fraction and decimal representations',
      'Difficulty recognizing the relationship between terms',
      'Struggle with mixed number formats',
    ],
    reassurance:
      'Like learning to switch between kilometres and miles - it seems tricky at first but becomes second nature with practice.',
  },
  parent_guide: {
    key_points: [
      'Patterns can be written in different but equivalent ways (½ = 0.5)',
      'Focus on the relationship between numbers, not just memorizing the sequence',
      'Regular practice with both formats builds confidence',
    ],
    quick_tips: [
      'Use measuring cups while cooking to practice',
      'Create simple patterns with pocket money',
      "Play 'spot the pattern' with price tags",
    ],
  },
};

export default function ConceptDetailScreen() {
  const { id } = useLocalSearchParams();
  const [activeSection, setActiveSection] = useState('why');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>{MOCK_CONCEPT.title}</Text>
        <ConceptDetailCard
          concept={MOCK_CONCEPT}
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
});
