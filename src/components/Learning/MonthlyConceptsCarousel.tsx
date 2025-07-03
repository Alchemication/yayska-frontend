import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { router } from 'expo-router';
import { getSubjectColor } from '../../utils/subjects/subjectColors';
import { trackEvent } from '../../utils/analytics';
import { crossPlatformAlert } from '../../utils/crossPlatformAlert';

// Types
export interface MonthlyConceptData {
  id: number;
  concept_name: string;
  concept_description: string;
  subject_id: number;
  subject_name: string;
  previously_studied?: boolean;
  previously_discussed?: boolean;
}

export interface Month {
  month_order: number;
  month_name: string;
  focus_statement: string;
  essential_concepts: MonthlyConceptData[];
  important_concepts: MonthlyConceptData[];
  supplementary_concepts: MonthlyConceptData[];
}

export interface CurriculumPlan {
  year_id: number;
  year_name: string;
  months: {
    previous?: Month;
    current: Month;
    next?: Month;
  };
}

interface MonthlyConceptsCarouselProps {
  curriculumPlans: CurriculumPlan[];
  selectedYearId?: number;
  isLoading: boolean;
  onViewAllConcepts: () => void;
}

const screenWidth = Dimensions.get('window').width;
const CARD_WIDTH = screenWidth * 0.75; // 75% of screen width for more peek
const CARD_SPACING = 12; // Space between cards

// A component to show section progress with icons
const SectionProgressIndicator = ({
  studied,
  discussed,
  total,
  onInfoPress,
}: {
  studied: number;
  discussed: number;
  total: number;
  onInfoPress: () => void;
}) => {
  return (
    <View style={styles.progressContainer}>
      <Ionicons
        name="book"
        size={14}
        color={studied > 0 ? colors.accent.success : colors.text.tertiary}
        style={styles.progressIcon}
      />
      <Text
        style={[
          styles.progressText,
          { color: studied > 0 ? colors.accent.success : colors.text.tertiary },
        ]}
      >
        {studied}
      </Text>

      <Ionicons
        name="chatbubble"
        size={14}
        color={discussed > 0 ? colors.primary.orange : colors.text.tertiary}
        style={styles.progressIcon}
      />
      <Text
        style={[
          styles.progressText,
          {
            color: discussed > 0 ? colors.primary.orange : colors.text.tertiary,
          },
        ]}
      >
        {discussed}
      </Text>

      <Text style={styles.totalText}>/ {total}</Text>

      <Pressable onPress={onInfoPress} style={styles.infoIcon}>
        <Ionicons
          name="information-circle-outline"
          size={20}
          color={colors.text.tertiary}
        />
      </Pressable>
    </View>
  );
};

export const MonthlyConceptsCarousel: React.FC<
  MonthlyConceptsCarouselProps
> = ({ curriculumPlans, selectedYearId, isLoading, onViewAllConcepts }) => {
  const [activeIndex, setActiveIndex] = useState(1); // Start with current month (index 1)
  const scrollViewRef = React.useRef<ScrollView>(null);

  // This useEffect must be here consistently
  React.useEffect(() => {
    if (scrollViewRef.current && !isLoading && curriculumPlans.length > 0) {
      const selectedPlan = selectedYearId
        ? curriculumPlans.find((plan) => plan.year_id === selectedYearId)
        : curriculumPlans[0];

      if (selectedPlan && selectedPlan.months) {
        setTimeout(() => {
          // Center the current month (index 1)
          const startX = (screenWidth - CARD_WIDTH) / 2; // Start with left padding
          const cardPosition = CARD_WIDTH + CARD_SPACING; // One card + spacing
          scrollViewRef.current?.scrollTo({
            x: startX + cardPosition,
            animated: false,
          });
        }, 100);
      }
    }
  }, [curriculumPlans, selectedYearId, isLoading]);

  // Filter for the selected year or use the first plan if no selection
  const selectedPlan = selectedYearId
    ? curriculumPlans.find((plan) => plan.year_id === selectedYearId)
    : curriculumPlans[0];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.green} />
        <Text style={styles.loadingText}>Loading monthly concepts...</Text>
      </View>
    );
  }

  if (!selectedPlan) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No curriculum plan available</Text>
        <Pressable style={styles.exploreButton} onPress={onViewAllConcepts}>
          <Text style={styles.exploreButtonText}>Explore All Concepts</Text>
        </Pressable>
      </View>
    );
  }

  const { months } = selectedPlan;
  const { previous, current, next } = months;

  // Build month array for carousel (only includes months that exist)
  const monthsArray: Month[] = [];
  if (previous) monthsArray.push(previous);
  monthsArray.push(current);
  if (next) monthsArray.push(next);

  const handleScroll = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const startX = (screenWidth - CARD_WIDTH) / 2;
    const adjustedScrollX = Math.max(0, scrollX - startX);
    const newIndex = Math.round(adjustedScrollX / (CARD_WIDTH + CARD_SPACING));
    const clampedIndex = Math.max(
      0,
      Math.min(newIndex, monthsArray.length - 1)
    );

    if (clampedIndex !== activeIndex) {
      const fromMonth = monthsArray[activeIndex];
      const toMonth = monthsArray[clampedIndex];

      // Simplified: Track meaningful navigation, not micro-interactions
      trackEvent('MONTHLY_CURRICULUM_NAVIGATION', {
        from_month: fromMonth?.month_name,
        to_month: toMonth?.month_name,
        navigation_type: 'swipe',
      });

      setActiveIndex(clampedIndex);
    }
  };

  const handleDotPress = (index: number) => {
    if (scrollViewRef.current) {
      const startX = (screenWidth - CARD_WIDTH) / 2;
      const cardPosition = index * (CARD_WIDTH + CARD_SPACING);
      scrollViewRef.current.scrollTo({
        x: startX + cardPosition,
        animated: true,
      });

      const fromMonth = monthsArray[activeIndex];
      const toMonth = monthsArray[index];

      // Simplified: Track meaningful navigation, not micro-interactions
      trackEvent('MONTHLY_CURRICULUM_NAVIGATION', {
        from_month: fromMonth?.month_name,
        to_month: toMonth?.month_name,
        navigation_type: 'dot_click',
      });

      setActiveIndex(index);
    }
  };

  const navigateToPrev = () => {
    if (activeIndex > 0 && scrollViewRef.current) {
      handleDotPress(activeIndex - 1);
    }
  };

  const navigateToNext = () => {
    if (activeIndex < monthsArray.length - 1 && scrollViewRef.current) {
      handleDotPress(activeIndex + 1);
    }
  };

  const navigateToConcept = (conceptId: number) => {
    // Find the concept details for tracking
    const allConcepts = monthsArray.flatMap((month) => [
      ...month.essential_concepts,
      ...month.important_concepts,
      ...month.supplementary_concepts,
    ]);
    const concept = allConcepts.find((c) => c.id === conceptId);
    const currentMonth = monthsArray[activeIndex];

    // Track concept click from carousel
    trackEvent('CONCEPT_CLICKED', {
      concept_id: conceptId,
      concept_name: concept?.concept_name,
      subject_name: concept?.subject_name,
      source_screen: 'home',
      source_component: 'monthly_carousel',
      month_name: currentMonth?.month_name,
      concept_priority: concept
        ? currentMonth?.essential_concepts.some((c) => c.id === conceptId)
          ? 'essential'
          : currentMonth?.important_concepts.some((c) => c.id === conceptId)
          ? 'important'
          : 'supplementary'
        : 'unknown',
    });

    router.push(`/concept/${conceptId}`);
  };

  const ConceptItem = ({ concept }: { concept: MonthlyConceptData }) => {
    const subjectColor = getSubjectColor(concept.subject_name);

    // Determine engagement state for styling
    const isDiscussed = concept.previously_discussed;
    const isStudied = concept.previously_studied;

    return (
      <Pressable
        style={styles.conceptItem}
        onPress={() => navigateToConcept(concept.id)}
      >
        <View
          style={[styles.subjectIndicator, { backgroundColor: subjectColor }]}
        />
        <View style={styles.conceptContent}>
          <Text style={styles.conceptName} numberOfLines={2}>
            {concept.concept_name}
          </Text>
          <View style={styles.conceptFooter}>
            <Text style={styles.subjectName}>{concept.subject_name}</Text>
            <View style={styles.badgeContainer}>
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
                    isStudied ? colors.neutral.white : colors.text.tertiary
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
                    isDiscussed ? colors.neutral.white : colors.text.tertiary
                  }
                />
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderMonthCard = (month: Month, index: number) => {
    // Limit the number of essential and important concepts shown to prevent overcrowding
    const essentialConceptsToShow = month.essential_concepts.slice(0, 5);
    const importantConceptsToShow = month.important_concepts.slice(0, 3);

    // Calculate progress statistics (non-hierarchical)
    const calculateProgress = (concepts: MonthlyConceptData[]) => {
      const studied = concepts.filter((c) => c.previously_studied).length;
      const discussed = concepts.filter((c) => c.previously_discussed).length;
      const total = concepts.length;

      return { discussed, studied, total };
    };

    const essentialProgress = calculateProgress(month.essential_concepts);
    const importantProgress = calculateProgress(
      month.important_concepts.slice(0, 3)
    );

    const showIconLegend = () => {
      crossPlatformAlert(
        'Engagement Icons',
        '📖: Indicates you have read a concept for at least 15 seconds.\n\n💬: Indicates you have discussed a concept with Yayska.'
      );
    };

    return (
      <View
        key={month.month_name}
        style={[
          styles.cardContainer,
          index === activeIndex && styles.activeCardContainer,
        ]}
      >
        <View style={styles.monthCard}>
          <View style={styles.monthHeader}>
            <Text style={styles.monthName}>{month.month_name}</Text>
          </View>

          <Text style={styles.focusStatement}>{month.focus_statement}</Text>

          <View style={styles.conceptsSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Essential Concepts</Text>
              <SectionProgressIndicator
                studied={essentialProgress.studied}
                discussed={essentialProgress.discussed}
                total={essentialProgress.total}
                onInfoPress={showIconLegend}
              />
            </View>
            {essentialConceptsToShow.map((concept) => (
              <ConceptItem key={concept.id} concept={concept} />
            ))}
            {month.essential_concepts.length > 5 && (
              <Pressable
                style={styles.viewMoreButton}
                onPress={onViewAllConcepts}
              >
                <Text style={styles.viewMoreText}>View More</Text>
              </Pressable>
            )}

            {!month.month_name.includes('Review') &&
              month.important_concepts.length > 0 && (
                <>
                  <View style={[styles.sectionHeaderRow, { marginTop: 16 }]}>
                    <Text style={styles.sectionTitle}>Important Concepts</Text>
                    <SectionProgressIndicator
                      studied={importantProgress.studied}
                      discussed={importantProgress.discussed}
                      total={importantProgress.total}
                      onInfoPress={showIconLegend}
                    />
                  </View>
                  {importantConceptsToShow.map((concept) => (
                    <ConceptItem key={concept.id} concept={concept} />
                  ))}

                  {month.important_concepts.length > 3 && (
                    <Pressable
                      style={styles.viewMoreButton}
                      onPress={onViewAllConcepts}
                    >
                      <Text style={styles.viewMoreText}>View More</Text>
                    </Pressable>
                  )}
                </>
              )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.carouselWrapper}>
        {/* Previous button - only show if not at first card */}
        {activeIndex > 0 && (
          <Pressable
            style={[styles.navButton, styles.navButtonLeft]}
            onPress={navigateToPrev}
            hitSlop={10}
          >
            <Ionicons
              name="chevron-back-circle"
              size={32}
              color={colors.primary.green}
            />
          </Pressable>
        )}

        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          onMomentumScrollEnd={handleScroll}
          contentContainerStyle={styles.scrollContent}
          snapToInterval={CARD_WIDTH + CARD_SPACING}
          snapToAlignment="start"
        >
          {/* Initial padding to ensure first card can be centered */}
          <View style={{ width: (screenWidth - CARD_WIDTH) / 2 }} />

          {monthsArray.map((month, index) => renderMonthCard(month, index))}

          {/* Final padding to ensure last card can be centered */}
          <View style={{ width: (screenWidth - CARD_WIDTH) / 2 }} />
        </ScrollView>

        {/* Next button - only show if not at last card */}
        {activeIndex < monthsArray.length - 1 && (
          <Pressable
            style={[styles.navButton, styles.navButtonRight]}
            onPress={navigateToNext}
            hitSlop={10}
          >
            <Ionicons
              name="chevron-forward-circle"
              size={32}
              color={colors.primary.green}
            />
          </Pressable>
        )}
      </View>

      {/* Pagination dots */}
      {monthsArray.length > 1 && (
        <View style={styles.pagination}>
          {monthsArray.map((_, index) => (
            <Pressable
              key={index}
              style={styles.paginationDotContainer}
              onPress={() => handleDotPress(index)}
            >
              <View
                style={[
                  styles.paginationDot,
                  index === activeIndex && styles.paginationDotActive,
                ]}
              />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  carouselWrapper: {
    position: 'relative', // For positioning the navigation buttons
  },
  scrollContent: {
    paddingVertical: 8,
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginRight: CARD_SPACING,
    transform: [{ scale: 0.92 }], // Smaller for inactive cards
    opacity: 0.8, // Slightly faded for inactive cards
  },
  activeCardContainer: {
    transform: [{ scale: 1 }], // Full size for active card
    opacity: 1, // Full opacity for active card
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  monthCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  monthHeader: {
    marginBottom: 8,
  },
  monthName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  focusStatement: {
    fontSize: 15,
    color: colors.text.secondary,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  conceptsSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 0,
    color: colors.text.primary,
  },
  conceptItem: {
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    marginBottom: 6,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.background.tertiary,
  },
  subjectIndicator: {
    width: 5,
  },
  conceptContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 10,
  },
  conceptName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 8,
  },
  conceptFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  subjectName: {
    fontSize: 12,
    color: colors.text.secondary,
    flexShrink: 1, // Prevent subject name from pushing out other elements
    textTransform: 'uppercase',
  },
  viewMoreButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.background.secondary,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary.green,
    marginTop: 8,
  },
  viewMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary.green,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    zIndex: 10,
    marginTop: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Add semi-transparent background
    borderRadius: 20,
    padding: 6,
  },
  navButtonLeft: {
    left: 0,
  },
  navButtonRight: {
    right: 0,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  paginationDotContainer: {
    padding: 8, // Larger hit area
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.background.tertiary,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: colors.primary.green,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.text.secondary,
  },
  errorContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  exploreButton: {
    backgroundColor: colors.primary.green,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Ring styles
  ringsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  emptyRing: {
    borderWidth: 2,
    borderColor: colors.neutral.lightGrey,
  },
  outerRing: {
    // No additional styles needed, all set inline
  },
  innerRing: {
    // No additional styles needed, all set inline
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressIcon: {
    marginRight: 2,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 10,
  },
  totalText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  infoIcon: {
    marginLeft: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
});
