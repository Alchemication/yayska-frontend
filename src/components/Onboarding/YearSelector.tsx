// src/components/Onboarding/YearSelector.tsx
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { colors, commonStyles } from '../../theme/colors';
import { api } from '../../services/api';
import { SchoolYear } from '../../types/education';
import { Ionicons } from '@expo/vector-icons';

type YearSelectorProps = {
  selectedYear: string | null;
  onYearSelect: (yearId: number, yearName: string) => void;
};

export function YearSelector({
  selectedYear,
  onYearSelect,
}: YearSelectorProps) {
  const [years, setYears] = useState<SchoolYear[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const { width: screenWidth } = Dimensions.get('window');

  useEffect(() => {
    loadSchoolYears();
  }, []);

  // Scroll to selected year when it changes
  useEffect(() => {
    if (selectedYear && scrollViewRef.current && years) {
      const selectedIndex = years.findIndex(
        (y) => y.year_name === selectedYear
      );
      if (selectedIndex >= 0) {
        // Calculate the position to scroll to (center the selected item)
        const itemWidth = 90; // Width of each item
        const offset = Math.max(
          0,
          selectedIndex * itemWidth - screenWidth / 2 + itemWidth / 2
        );

        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ x: offset, animated: true });
        }, 100);
      }
    }
  }, [selectedYear, years, screenWidth]);

  const loadSchoolYears = async () => {
    try {
      setLoading(true);
      const yearsData = await api.getSchoolYears(1); // Primary school level
      setYears(yearsData);
    } catch (error) {
      console.error('Error loading school years:', error);
      setError('Failed to load school years');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.green} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={loadSchoolYears}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  // For development, use hardcoded data if API fails
  const fallbackYears = [
    { id: 1, year_name: 'Junior Infants', year_order: 1 },
    { id: 2, year_name: 'Senior Infants', year_order: 2 },
    { id: 3, year_name: '1st Class', year_order: 3 },
    { id: 4, year_name: '2nd Class', year_order: 4 },
    { id: 5, year_name: '3rd Class', year_order: 5 },
    { id: 6, year_name: '4th Class', year_order: 6 },
    { id: 7, year_name: '5th Class', year_order: 7 },
    { id: 8, year_name: '6th Class', year_order: 8 },
  ];

  const displayYears = years && years.length > 0 ? years : fallbackYears;

  return (
    <View style={styles.container}>
      <View style={styles.hintContainer}>
        {!selectedYear ? (
          <Text style={styles.hintText}>
            Scroll and tap to select your child's school year
          </Text>
        ) : (
          <View style={styles.placeholderHint} />
        )}
      </View>

      {/* Visual timeline track */}
      <View style={styles.timelineTrack} />

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
      >
        {displayYears.map((year, index) => {
          const isSelected = selectedYear === year.year_name;

          return (
            <Pressable
              key={year.id}
              style={styles.yearItem}
              onPress={() => onYearSelect(year.id, year.year_name)}
            >
              {/* Timeline node with background */}
              <View style={styles.nodeContainer}>
                {isSelected && <View style={styles.nodeBackground} />}
                <View
                  style={[
                    styles.timelineNode,
                    isSelected && styles.timelineNodeSelected,
                  ]}
                >
                  {isSelected && (
                    <Ionicons
                      name="checkmark"
                      size={12}
                      color="#fff"
                      style={styles.checkmark}
                    />
                  )}
                </View>
              </View>

              {/* Year card */}
              <View
                style={[styles.yearCard, isSelected && styles.yearCardSelected]}
              >
                <Text
                  style={[
                    styles.yearText,
                    isSelected && styles.yearTextSelected,
                  ]}
                  numberOfLines={2}
                >
                  {year.year_name}
                </Text>
                <Text style={styles.stepText}>{`Year ${index + 1}`}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    paddingBottom: 10,
  },
  hintContainer: {
    height: 30,
    justifyContent: 'center',
    marginBottom: 12,
  },
  placeholderHint: {
    height: 18,
  },
  hintText: {
    color: colors.text.tertiary,
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  timelineTrack: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.neutral.lightGrey,
  },
  nodeContainer: {
    height: 30,
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeBackground: {
    display: 'none',
  },
  yearItem: {
    width: 90,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  timelineNode: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.background.tertiary,
    borderWidth: 2,
    borderColor: colors.neutral.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineNodeSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary.green,
    borderColor: colors.primary.green,
    borderWidth: 2,
  },
  checkmark: {
    marginTop: 0,
  },
  yearCard: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: colors.background.tertiary,
    borderRadius: commonStyles.borderRadius.small,
    alignItems: 'center',
    width: '100%',
    height: 70,
    justifyContent: 'center',
  },
  yearCardSelected: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.primary.green,
    ...commonStyles.shadow,
  },
  yearText: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearTextSelected: {
    color: colors.primary.green,
    fontWeight: '600',
  },
  stepText: {
    fontSize: 11,
    color: colors.text.tertiary,
    marginTop: 4,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: colors.accent.error,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: colors.primary.green,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: commonStyles.borderRadius.medium,
  },
  retryButtonText: {
    color: colors.neutral.white,
    fontWeight: '500',
  },
});
