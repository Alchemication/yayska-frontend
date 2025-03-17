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

  const ConceptItem = ({ concept }: { concept: MonthlyConceptData }) => (
    <Pressable
      style={styles.conceptItem}
      onPress={() => navigateToConcept(concept.id)}
    >
      <View style={styles.conceptTitleRow}>
        <Text style={styles.conceptName}>{concept.concept_name}</Text>
        <Text style={styles.subjectName}>{concept.subject_name}</Text>
      </View>
      <Text style={styles.conceptDescription} numberOfLines={2}>
        {concept.concept_description}
      </Text>
    </Pressable>
  );

  const renderMonthCard = (month: Month, index: number) => {
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
            {month.essential_concepts.map((concept) => (
              <ConceptItem key={concept.id} concept={concept} />
            ))}

            {!month.month_name.includes('Review') &&
              month.important_concepts.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Important Concepts</Text>
                  {month.important_concepts.slice(0, 3).map((concept) => (
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
      <View style={styles.carouselHeader}>
        <View style={{ flex: 1 }} />
        <Pressable style={styles.exploreAllButton} onPress={onViewAllConcepts}>
          <Text style={styles.exploreAllText}>Explore All</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors.primary.green}
          />
        </Pressable>
      </View>

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
              size={28}
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
              size={28}
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
    marginBottom: 24,
  },
  carouselHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  carouselWrapper: {
    position: 'relative', // For positioning the navigation buttons
  },
  scrollContent: {
    paddingVertical: 16,
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
    minHeight: 400, // Set a minimum height for consistency
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  monthName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  focusStatement: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  conceptsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  conceptItem: {
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  conceptTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conceptName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  subjectName: {
    fontSize: 12,
    color: colors.primary.green,
    fontWeight: '500',
  },
  conceptDescription: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  viewMoreButton: {
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 8,
  },
  viewMoreText: {
    fontSize: 14,
    color: colors.primary.green,
    fontWeight: '500',
  },
  loadingContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
  },
  errorContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  errorText: {
    marginBottom: 16,
    fontSize: 16,
    color: colors.text.secondary,
  },
  exploreAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exploreAllText: {
    fontSize: 14,
    color: colors.primary.green,
    fontWeight: '500',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  paginationDotContainer: {
    padding: 8, // Make hit area larger for better touch response
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral.lightGrey,
  },
  paginationDotActive: {
    backgroundColor: colors.primary.green,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    padding: 4,
    marginTop: -20, // Half the height to center
  },
  navButtonLeft: {
    left: 5,
  },
  navButtonRight: {
    right: 5,
  },
});
