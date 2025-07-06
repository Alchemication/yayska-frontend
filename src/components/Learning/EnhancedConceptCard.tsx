import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, commonStyles } from '../../theme/colors';
import { ConceptInPath } from '../../types/curriculum';
import { trackEvent } from '../../utils/analytics';

interface EnhancedConceptCardProps {
  concept: ConceptInPath;
  onPress?: () => void;
}

export function EnhancedConceptCard({
  concept,
  onPress,
}: EnhancedConceptCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const handleViewDetails = () => {
    trackEvent('CONCEPT_DETAILS_VIEWED', {
      concept_id: concept.id,
      concept_name: concept.name,
      subject_name: concept.subject_name,
      source: 'explore_view',
    });
    router.push(`/concept/${concept.id}`);
  };

  // Determine engagement state for styling
  const isDiscussed = concept.previously_discussed;
  const isStudied = concept.previously_studied;

  return (
    <View style={styles.container}>
      <Pressable style={styles.header} onPress={handlePress}>
        <View style={styles.content}>
          <View style={styles.topRow}>
            <View style={styles.mainContent}>
              <View style={styles.conceptHeader}>
                <Text style={styles.conceptName} numberOfLines={2}>
                  {concept.name}
                </Text>
                <View style={styles.rightSection}>
                  <View style={styles.progressIndicators}>
                    <View
                      style={[
                        styles.iconWrapper,
                        isStudied && styles.studiedIconWrapper,
                      ]}
                    >
                      <Ionicons
                        name={isStudied ? 'book' : 'book-outline'}
                        size={12}
                        color={
                          isStudied
                            ? colors.neutral.white
                            : colors.text.tertiary
                        }
                      />
                    </View>
                    <View
                      style={[
                        styles.iconWrapper,
                        isDiscussed && styles.discussedIconWrapper,
                      ]}
                    >
                      <Ionicons
                        name={isDiscussed ? 'chatbubble' : 'chatbubble-outline'}
                        size={12}
                        color={
                          isDiscussed
                            ? colors.neutral.white
                            : colors.text.tertiary
                        }
                      />
                    </View>
                  </View>
                  <View style={styles.expandIcon}>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={colors.text.secondary}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>

          {isExpanded && (
            <View style={styles.expandedContent}>
              <Text style={styles.description}>{concept.description}</Text>

              {concept.learning_objectives &&
                concept.learning_objectives.length > 0 && (
                  <View style={styles.objectivesSection}>
                    <Text style={styles.sectionTitle}>
                      Learning Objectives:
                    </Text>
                    {concept.learning_objectives.map((objective, index) => (
                      <Text key={index} style={styles.objectiveText}>
                        • {objective}
                      </Text>
                    ))}
                  </View>
                )}

              <Pressable
                style={styles.detailsButton}
                onPress={handleViewDetails}
              >
                <Text style={styles.detailsButtonText}>View Full Details</Text>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color={colors.primary.green}
                />
              </Pressable>
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.background.tertiary,
    overflow: 'hidden',
    ...commonStyles.shadow,
  },
  header: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  mainContent: {
    flex: 1,
  },
  conceptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conceptName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    lineHeight: 22,
    flex: 1,
    marginRight: 12,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandIcon: {
    marginLeft: 12,
  },
  iconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  studiedIconWrapper: {
    backgroundColor: colors.accent.success,
  },
  discussedIconWrapper: {
    backgroundColor: colors.primary.orange,
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.background.tertiary,
  },
  description: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  objectivesSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  objectiveText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    padding: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary.green,
  },
});
