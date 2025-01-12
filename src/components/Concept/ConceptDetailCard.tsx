// src/components/Concept/ConceptDetailCard.tsx
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { colors, commonStyles } from '../../theme/colors';
import { ConceptMetadata } from '../../types/concept';

type SectionType = {
  id: string;
  icon: string;
  title: string;
  color: string;
};

type ConceptDetailCardProps = {
  concept: ConceptMetadata | null;
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
};

const SECTIONS: SectionType[] = [
  {
    id: 'why',
    icon: '🎯',
    title: 'Why Important',
    color: colors.primary.green,
  },
  {
    id: 'difficulty',
    icon: '📊',
    title: 'Difficulty',
    color: colors.primary.orange,
  },
  {
    id: 'guide',
    icon: '💡',
    title: 'Parent Guide',
    color: colors.accent.info,
  },
];

export function ConceptDetailCard({
  concept,
  activeSection,
  onSectionChange,
}: ConceptDetailCardProps) {
  if (!concept) return null;

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'why':
        return (
          <View style={styles.sectionContent}>
            <Text style={styles.contentTitle}>Practical Value</Text>
            <Text style={styles.contentText}>
              {concept.why_important.practical_value}
            </Text>

            <Text style={styles.contentTitle}>Future Learning</Text>
            <Text style={styles.contentText}>
              {concept.why_important.future_learning}
            </Text>

            <Text style={styles.contentTitle}>Modern Relevance</Text>
            <Text style={styles.contentText}>
              {concept.why_important.modern_relevance}
            </Text>
          </View>
        );
      case 'difficulty':
        return (
          <View style={styles.sectionContent}>
            <Text style={styles.contentTitle}>
              Challenge Level: {concept.difficulty_stats.challenge_rate}/10
            </Text>

            <Text style={styles.contentTitle}>Common Barriers</Text>
            {concept.difficulty_stats.common_barriers.map((barrier, index) => (
              <Text key={index} style={styles.bulletPoint}>
                • {barrier}
              </Text>
            ))}

            <Text style={styles.contentTitle}>Reassurance</Text>
            <Text style={styles.contentText}>
              {concept.difficulty_stats.reassurance}
            </Text>
          </View>
        );
      case 'guide':
        return (
          <View style={styles.sectionContent}>
            <Text style={styles.contentTitle}>Key Points</Text>
            {concept.parent_guide.key_points.map((point, index) => (
              <Text key={index} style={styles.bulletPoint}>
                • {point}
              </Text>
            ))}

            <Text style={styles.contentTitle}>Quick Tips</Text>
            {concept.parent_guide.quick_tips.map((tip, index) => (
              <Text key={index} style={styles.bulletPoint}>
                • {tip}
              </Text>
            ))}
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconsContainer}>
        {SECTIONS.map((section) => (
          <Pressable
            key={section.id}
            style={[
              styles.iconButton,
              { backgroundColor: section.color },
              activeSection === section.id && styles.iconButtonActive,
            ]}
            onPress={() => onSectionChange(section.id)}
          >
            <Text style={styles.iconText}>{section.icon}</Text>
            <Text style={styles.iconLabel}>{section.title}</Text>
          </Pressable>
        ))}
      </View>

      {renderSectionContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  iconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    marginBottom: 20,
  },
  iconButton: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 60,
    width: 100,
    height: 100,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...commonStyles.shadow,
  },
  iconButtonActive: {
    transform: [{ scale: 1.1 }],
    borderColor: colors.neutral.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  iconText: {
    fontSize: 24,
    marginBottom: 4,
  },
  iconLabel: {
    fontSize: 12,
    color: colors.neutral.white,
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionContent: {
    padding: 20,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  contentText: {
    fontSize: 16,
    color: colors.text.secondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  bulletPoint: {
    fontSize: 16,
    color: colors.text.secondary,
    lineHeight: 24,
    marginLeft: 8,
    marginBottom: 8,
  },
});
