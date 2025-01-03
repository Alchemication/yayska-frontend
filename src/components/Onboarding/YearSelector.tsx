// src/components/Onboarding/YearSelector.tsx
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { colors, commonStyles } from '../../theme/colors';
import { api } from '../../services/api';
import { SchoolYear } from '../../types/education';

type YearSelectorProps = {
  selectedYear: string | null;
  onYearSelect: (yearId: number, yearName: string) => void;
};

export function YearSelector({
  selectedYear,
  onYearSelect,
}: YearSelectorProps) {
  const [years, setYears] = useState<SchoolYear[] | null>(null); // Initialize as null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSchoolYears();
  }, []);

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
      {displayYears.map((year) => (
        <Pressable
          key={year.id}
          style={[
            styles.yearButton,
            selectedYear === year.year_name && styles.yearButtonSelected,
          ]}
          onPress={() => onYearSelect(year.id, year.year_name)}
        >
          <Text
            style={[
              styles.yearText,
              selectedYear === year.year_name && styles.yearTextSelected,
            ]}
          >
            {year.year_name}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  yearButton: {
    backgroundColor: colors.background.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: commonStyles.borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.neutral.lightGrey,
  },
  yearButtonSelected: {
    backgroundColor: colors.primary.green,
    borderColor: colors.primary.green,
  },
  yearText: {
    color: colors.text.primary,
    fontSize: 14,
  },
  yearTextSelected: {
    color: colors.neutral.white,
    fontWeight: '500',
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
