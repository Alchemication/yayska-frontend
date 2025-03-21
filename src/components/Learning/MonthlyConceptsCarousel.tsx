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

// Types
export interface MonthlyConceptData {
  id: number;
  concept_name: string;
  concept_description: string;
  subject_id: number;
  subject_name: string;
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
  const monthsArray = [];
  if (previous) monthsArray.push(previous);
  monthsArray.push(current);
  if (next) monthsArray.push(next);

  const handleScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    // Calculate the active index based on the center position
    const adjustedX = offsetX - (screenWidth - CARD_WIDTH) / 2;
    const index = Math.round(adjustedX / (CARD_WIDTH + CARD_SPACING));
    setActiveIndex(Math.max(0, Math.min(index, monthsArray.length - 1)));
  };

  const handleDotPress = (index: number) => {
    if (scrollViewRef.current) {
      const startX = (screenWidth - CARD_WIDTH) / 2; // Start with left padding
      const cardPosition = index * (CARD_WIDTH + CARD_SPACING); // Card index * (width + spacing)
      scrollViewRef.current.scrollTo({
        x: startX + cardPosition,
        animated: true,
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
    router.push(`/concept/${conceptId}`);
  };

  const ConceptItem = ({ concept }: { concept: MonthlyConceptData }) => {
    // Get subject color using centralized utility
    const subjectColor = getSubjectColor(concept.subject_name);

    return (
      <Pressable
        style={styles.conceptItem}
        onPress={() => navigateToConcept(concept.id)}
      >
        {/* Color indicator for subject */}
        <View
          style={[styles.subjectIndicator, { backgroundColor: subjectColor }]}
        />

        {/* Content area */}
        <View style={styles.conceptContent}>
          <Text style={styles.conceptName} numberOfLines={2}>
            {concept.concept_name}
          </Text>
          <Text style={styles.subjectName}>{concept.subject_name}</Text>
        </View>
      </Pressable>
    );
  };

  const renderMonthCard = (month: Month, index: number) => {
    // Limit the number of essential and important concepts shown to prevent overcrowding
    const essentialConceptsToShow = month.essential_concepts.slice(0, 5);
    const importantConceptsToShow = month.important_concepts.slice(0, 3);

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
            <Text style={styles.sectionTitle}>Essential Concepts</Text>
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
                  <Text style={styles.sectionTitle}>Important Concepts</Text>
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
          onMomentumScrollEnd={handleScrollEnd}
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
    padding: 16,
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
    backgroundColor: colors.background.tertiary,
    borderRadius: 8,
    marginBottom: 6,
    minHeight: 62,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  subjectIndicator: {
    width: 4,
    backgroundColor: colors.primary.green,
  },
  conceptContent: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 10,
  },
  conceptName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 3,
  },
  subjectName: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  conceptDescription: {
    fontSize: 14,
    color: colors.text.secondary,
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
    color: colors.primary.green,
    fontWeight: '500',
    fontSize: 14,
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
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: colors.text.secondary,
    fontSize: 14,
  },
  errorContainer: {
    padding: 32,
    alignItems: 'center',
  },
  errorText: {
    marginBottom: 16,
    color: colors.text.secondary,
    fontSize: 16,
  },
  exploreButton: {
    backgroundColor: colors.primary.green,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  exploreButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
});
