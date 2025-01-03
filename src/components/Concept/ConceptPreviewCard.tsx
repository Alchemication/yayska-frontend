// src/components/Concept/ConceptPreviewCard.tsx
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { colors, commonStyles } from '../../theme/colors';
import { Concept } from '../../types/curriculum';

interface ConceptPreviewCardProps {
  concept: Concept;
  onPress: () => void;
}

export function ConceptPreviewCard({
  concept,
  onPress,
}: ConceptPreviewCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title}>{concept.concept_name}</Text>
        <View
          style={[
            styles.difficultyBadge,
            { backgroundColor: getDifficultyColor(concept.difficulty_level) },
          ]}
        >
          <Text style={styles.difficultyText}>
            Level {concept.difficulty_level}
          </Text>
        </View>
      </View>

      <Text style={styles.description}>{concept.description}</Text>

      <View style={styles.footer}>
        <View style={styles.infoTag}>
          <Text style={styles.infoIcon}>📚</Text>
          <Text style={styles.infoText}>View Details</Text>
        </View>
        <Text style={styles.learnMore}>Learn more →</Text>
      </View>
    </Pressable>
  );
}

function getDifficultyColor(level: number): string {
  if (level <= 3) return colors.difficulty.easy;
  if (level <= 6) return colors.difficulty.medium;
  return colors.difficulty.hard;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: commonStyles.borderRadius.medium,
    padding: 16,
    marginBottom: 12,
    ...commonStyles.shadow,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: commonStyles.borderRadius.small,
    marginLeft: 8,
  },
  difficultyText: {
    color: colors.neutral.white,
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  infoTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 4,
    fontSize: 16,
  },
  infoText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  learnMore: {
    color: colors.primary.green,
    fontSize: 14,
    fontWeight: '500',
  },
});
