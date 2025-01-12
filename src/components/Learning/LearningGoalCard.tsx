// src/components/Learning/LearningGoalCard.tsx
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { colors, commonStyles } from '../../theme/colors';
import { ConceptInPath } from '../../types/curriculum';
import { ComplexityIndicator } from './ComplexityIndicator';
import { Ionicons } from '@expo/vector-icons';

interface LearningGoalCardProps {
  concept: ConceptInPath;
}

export function LearningGoalCard({ concept }: LearningGoalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.headerContent}>
          <ComplexityIndicator level={concept.complexity.level} />

          <Text style={styles.topic}>{concept.name}</Text>

          <View style={styles.learningSection}>
            <Text style={styles.sectionTitle}>Description:</Text>
            <Text style={styles.outcomeText}>{concept.description}</Text>
          </View>
        </View>

        <View style={styles.expandButton}>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={colors.text.secondary}
          />
        </View>
      </Pressable>

      {isExpanded && (
        <View style={styles.objectivesSection}>
          <Text style={styles.sectionTitle}>Learning Objectives:</Text>
          {concept.learning_objectives.map((objective, index) => (
            <View key={index} style={styles.objectiveItem}>
              <Text style={styles.objectiveText}>• {objective}</Text>
            </View>
          ))}
          <Pressable
            style={styles.detailsButton}
            onPress={() => router.push(`/concept/${concept.id}`)}
          >
            <Text style={styles.detailsButtonText}>View Details</Text>
            <Ionicons
              name="arrow-forward"
              size={16}
              color={colors.primary.green}
            />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: commonStyles.borderRadius.medium,
    padding: 16,
    marginBottom: 16,
    ...commonStyles.shadow,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
  },
  expandButton: {
    padding: 8,
    marginLeft: 8,
    marginTop: -8,
  },
  topic: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  learningSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 8,
  },
  outcomeText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  objectivesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGrey,
  },
  objectiveItem: {
    marginBottom: 8,
  },
  objectiveText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    padding: 12,
    borderRadius: commonStyles.borderRadius.small,
    marginTop: 12,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary.green,
  },
});
