// src/components/Learning/LearningGoalCard.tsx
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { colors, commonStyles } from '../../theme/colors';
import { LearningGoal } from '../../types/curriculum';
import { ComplexityIndicator } from './ComplexityIndicator';
import { Ionicons } from '@expo/vector-icons'; // Make sure to install @expo/vector-icons if not already installed

interface LearningGoalCardProps {
  goal: LearningGoal;
}

export function LearningGoalCard({ goal }: LearningGoalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.headerContent}>
          <ComplexityIndicator level={goal.complexity_level} />

          <Text style={styles.topic}>{goal.topic}</Text>

          <View style={styles.learningSection}>
            <Text style={styles.sectionTitle}>What your child will learn:</Text>
            <Text style={styles.outcomeText}>{goal.what_child_will_learn}</Text>
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
        <View style={styles.conceptsSection}>
          <Text style={styles.sectionTitle}>Key concepts to master:</Text>
          {goal.key_concepts.map((concept) => (
            <Pressable
              key={concept.id}
              style={styles.conceptCard}
              onPress={() => router.push(`/concept/${concept.id}`)}
            >
              <View style={styles.conceptHeader}>
                <Text style={styles.conceptName}>{concept.name}</Text>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color={colors.primary.green}
                />
              </View>
              <Text style={styles.conceptDescription}>
                {concept.description}
              </Text>
            </Pressable>
          ))}
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
    marginTop: -8, // Adjust to align with header
  },
  topic: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  learningSection: {
    marginBottom: 8, // Reduced from 16 since we're in header now
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
  conceptsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGrey,
    gap: 8,
  },
  conceptCard: {
    backgroundColor: colors.background.secondary,
    padding: 12,
    borderRadius: commonStyles.borderRadius.small,
  },
  conceptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conceptName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    flex: 1,
  },
  conceptDescription: {
    fontSize: 12,
    color: colors.text.secondary,
  },
});
