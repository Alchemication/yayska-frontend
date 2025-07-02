// src/components/Concept/ConceptDetailCard.tsx
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Animated,
  ScrollView,
} from 'react-native';
import { colors, commonStyles } from '../../theme/colors';
import { ConceptMetadata } from '../../types/concept';
import { useState, useEffect } from 'react';

type SectionType = {
  id: string;
  icon: string; // Use emoji as text
  title: string;
  color: string;
};

type ConceptDetailCardProps = {
  concept: ConceptMetadata | null;
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
};

// Define sections for the concept detail tabs
const SECTIONS: SectionType[] = [
  {
    id: 'why',
    icon: '🎯',
    title: 'Why Learn',
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
    title: 'Guide',
    color: colors.accent.info,
  },
  {
    id: 'practice',
    icon: '🔄',
    title: 'Practice',
    color: colors.accent.info,
  },
  {
    id: 'language',
    icon: '🗣️',
    title: 'Irish',
    color: colors.accent.success,
  },
];

export function ConceptDetailCard({
  concept,
  activeSection,
  onSectionChange,
}: ConceptDetailCardProps) {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Fade in animation when section changes
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    return () => {
      fadeAnim.setValue(0);
    };
  }, [activeSection]);

  if (!concept) return null;

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'why':
        return (
          <Animated.View style={[styles.sectionContent, { opacity: fadeAnim }]}>
            <View style={styles.contentCard}>
              <Text style={styles.contentTitle}>Practical Value</Text>
              <Text style={styles.contentText}>
                {concept.why_important.practical_value}
              </Text>
            </View>

            <View style={styles.contentCard}>
              <Text style={styles.contentTitle}>Future Learning</Text>
              <Text style={styles.contentText}>
                {concept.why_important.future_learning}
              </Text>
            </View>

            <View style={styles.contentCard}>
              <Text style={styles.contentTitle}>Modern Relevance</Text>
              <Text style={styles.contentText}>
                {concept.why_important.modern_relevance}
              </Text>
            </View>

            {concept.learning_path?.success_indicators && (
              <View style={styles.contentCard}>
                <Text style={styles.contentTitle}>Success Indicators</Text>
                {concept.learning_path.success_indicators.map(
                  (indicator, index) => (
                    <Text key={index} style={styles.bulletPoint}>
                      • {indicator}
                    </Text>
                  )
                )}
              </View>
            )}
          </Animated.View>
        );
      case 'difficulty':
        return (
          <Animated.View style={[styles.sectionContent, { opacity: fadeAnim }]}>
            <View style={styles.contentCard}>
              <Text style={styles.contentTitle}>
                Challenge Level: {concept.difficulty_stats.challenge_rate}/10
              </Text>
              <View style={styles.challengeBar}>
                <View
                  style={[
                    styles.challengeFill,
                    {
                      width: `${concept.difficulty_stats.challenge_rate * 10}%`,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.contentCard}>
              <Text style={styles.contentTitle}>Common Barriers</Text>
              {concept.difficulty_stats.common_barriers.map(
                (barrier, index) => (
                  <Text key={index} style={styles.bulletPoint}>
                    • {barrier}
                  </Text>
                )
              )}
            </View>

            <View style={styles.contentCard}>
              <Text style={styles.contentTitle}>Reassurance</Text>
              <Text style={styles.contentText}>
                {concept.difficulty_stats.reassurance}
              </Text>
            </View>

            {concept.time_guide && (
              <View style={styles.contentCard}>
                <Text style={styles.contentTitle}>Time to Master</Text>
                <View style={styles.timeGuideTable}>
                  <View style={styles.timeGuideHeader}>
                    <Text style={styles.timeGuideHeaderCell}>Learner Type</Text>
                    <Text style={styles.timeGuideHeaderCell}>Weeks</Text>
                    <Text style={styles.timeGuideHeaderCell}>
                      Sessions/Week
                    </Text>
                    <Text style={styles.timeGuideHeaderCell}>
                      Minutes/Session
                    </Text>
                  </View>

                  {concept.time_guide.quick_learner && (
                    <View style={styles.timeGuideRow}>
                      <Text style={styles.timeGuideCell}>Quick</Text>
                      <Text style={styles.timeGuideCell}>
                        {concept.time_guide.quick_learner.weeks_to_master}
                      </Text>
                      <Text style={styles.timeGuideCell}>
                        {concept.time_guide.quick_learner.sessions_per_week}
                      </Text>
                      <Text style={styles.timeGuideCell}>
                        {concept.time_guide.quick_learner.minutes_per_session}
                      </Text>
                    </View>
                  )}

                  {concept.time_guide.typical_learner && (
                    <View style={styles.timeGuideRow}>
                      <Text style={styles.timeGuideCell}>Typical</Text>
                      <Text style={styles.timeGuideCell}>
                        {concept.time_guide.typical_learner.weeks_to_master}
                      </Text>
                      <Text style={styles.timeGuideCell}>
                        {concept.time_guide.typical_learner.sessions_per_week}
                      </Text>
                      <Text style={styles.timeGuideCell}>
                        {concept.time_guide.typical_learner.minutes_per_session}
                      </Text>
                    </View>
                  )}

                  {concept.time_guide.additional_support && (
                    <View style={styles.timeGuideRow}>
                      <Text style={styles.timeGuideCell}>With Support</Text>
                      <Text style={styles.timeGuideCell}>
                        {concept.time_guide.additional_support.weeks_to_master}
                      </Text>
                      <Text style={styles.timeGuideCell}>
                        {
                          concept.time_guide.additional_support
                            .sessions_per_week
                        }
                      </Text>
                      <Text style={styles.timeGuideCell}>
                        {
                          concept.time_guide.additional_support
                            .minutes_per_session
                        }
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </Animated.View>
        );
      case 'guide':
        return (
          <Animated.View style={[styles.sectionContent, { opacity: fadeAnim }]}>
            <View style={styles.contentCard}>
              <Text style={styles.contentTitle}>Key Points</Text>
              {concept.parent_guide.key_points.map((point, index) => (
                <Text key={index} style={styles.bulletPoint}>
                  • {point}
                </Text>
              ))}
            </View>

            <View style={styles.contentCard}>
              <Text style={styles.contentTitle}>Quick Tips</Text>
              {concept.parent_guide.quick_tips.map((tip, index) => (
                <Text key={index} style={styles.bulletPoint}>
                  • {tip}
                </Text>
              ))}
            </View>

            {concept.assessment_approaches && (
              <View style={styles.contentCard}>
                <Text style={styles.contentTitle}>Assessment Approaches</Text>
                <Text style={styles.contentText}>
                  {concept.assessment_approaches.reasoning}
                </Text>
                {concept.assessment_approaches.suitable_types && (
                  <View style={styles.tagsContainer}>
                    {concept.assessment_approaches.suitable_types.map(
                      (type, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{type}</Text>
                        </View>
                      )
                    )}
                  </View>
                )}
              </View>
            )}
          </Animated.View>
        );
      case 'practice':
        return (
          <Animated.View style={[styles.sectionContent, { opacity: fadeAnim }]}>
            {concept.real_world && (
              <>
                {concept.real_world.examples && (
                  <View style={styles.contentCard}>
                    <Text style={styles.contentTitle}>Real-World Examples</Text>
                    {concept.real_world.examples.map((example, index) => (
                      <Text key={index} style={styles.bulletPoint}>
                        • {example}
                      </Text>
                    ))}
                  </View>
                )}

                {concept.real_world.irish_context && (
                  <View style={styles.contentCard}>
                    <Text style={styles.contentTitle}>Irish Context</Text>
                    <Text style={styles.contentText}>
                      {concept.real_world.irish_context}
                    </Text>
                  </View>
                )}

                {concept.real_world.practice_ideas && (
                  <View style={styles.contentCard}>
                    <Text style={styles.contentTitle}>Practice Ideas</Text>
                    {concept.real_world.practice_ideas.map((idea, index) => (
                      <Text key={index} style={styles.bulletPoint}>
                        • {idea}
                      </Text>
                    ))}
                  </View>
                )}
              </>
            )}
          </Animated.View>
        );
      case 'language':
        return (
          <Animated.View style={[styles.sectionContent, { opacity: fadeAnim }]}>
            {concept.irish_language_support &&
              concept.irish_language_support.educational_terms && (
                <View style={styles.contentCard}>
                  <Text style={styles.contentTitle}>Key Irish Phrases</Text>
                  {concept.irish_language_support.educational_terms.map(
                    (term, index) => (
                      <View key={index} style={styles.languageItem}>
                        <View style={styles.languageTermRow}>
                          <Text style={styles.irishTerm}>{term.irish}</Text>
                          <Text style={styles.englishTerm}>{term.english}</Text>
                        </View>
                        <Text style={styles.pronunciation}>
                          Pronunciation: {term.pronunciation}
                        </Text>
                        <Text style={styles.example}>
                          Example: {term.example}
                        </Text>
                      </View>
                    )
                  )}
                </View>
              )}
          </Animated.View>
        );
      // Default case to handle unknown sections
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabs}
        >
          {SECTIONS.map((section) => (
            <Pressable
              key={section.id}
              style={[
                styles.tab,
                activeSection === section.id && styles.activeTab,
              ]}
              onPress={() => onSectionChange(section.id)}
            >
              <Text style={styles.tabIcon}>{section.icon}</Text>
              <Text
                style={[
                  styles.tabText,
                  activeSection === section.id && styles.activeTabText,
                ]}
              >
                {section.title}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      {renderSectionContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGrey,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  subject: {
    fontSize: 16,
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.tertiary,
  },
  tabs: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: colors.background.tertiary,
  },
  tabIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  sectionContent: {
    padding: 16,
  },
  contentCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    ...commonStyles.shadow,
  },
  contentTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 10,
  },
  contentText: {
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  bulletPoint: {
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 22,
    marginLeft: 8,
    marginBottom: 8,
  },
  challengeBar: {
    height: 10,
    backgroundColor: colors.background.tertiary,
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: 8,
  },
  challengeFill: {
    height: '100%',
    backgroundColor: colors.primary.orange,
    borderRadius: 5,
  },
  timeGuideTable: {
    marginTop: 10,
  },
  timeGuideHeader: {
    flexDirection: 'row',
    backgroundColor: colors.background.tertiary,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    padding: 8,
  },
  timeGuideHeaderCell: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
  },
  timeGuideRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.background.tertiary,
    padding: 8,
  },
  timeGuideCell: {
    flex: 1,
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  tag: {
    backgroundColor: colors.accent.info + '30', // 30% opacity
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 13,
    color: colors.accent.info,
    fontWeight: '500',
  },
  languageItem: {
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.tertiary,
  },
  languageTermRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  irishTerm: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  englishTerm: {
    fontSize: 15,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  pronunciation: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  example: {
    fontSize: 14,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
});
