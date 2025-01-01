// src/components/Onboarding/YearSelector.tsx
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { colors, commonStyles } from '../../theme/colors';

const SCHOOL_YEARS = [
  'Junior Infants',
  'Senior Infants',
  '1st Class',
  '2nd Class',
  '3rd Class',
  '4th Class',
  '5th Class',
  '6th Class',
];

type YearSelectorProps = {
  selectedYear: string | null;
  onYearSelect: (year: string) => void;
};

export function YearSelector({
  selectedYear,
  onYearSelect,
}: YearSelectorProps) {
  return (
    <View style={styles.container}>
      {SCHOOL_YEARS.map((year) => (
        <Pressable
          key={year}
          style={({ pressed }) => [
            styles.yearButton,
            selectedYear === year && styles.yearButtonSelected,
            pressed && styles.yearButtonPressed,
          ]}
          onPress={() => onYearSelect(year)}
        >
          <Text
            style={[
              styles.yearText,
              selectedYear === year && styles.yearTextSelected,
            ]}
          >
            {year}
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
  yearButtonPressed: {
    opacity: 0.8,
  },
  yearText: {
    color: colors.text.primary,
    fontSize: 14,
  },
  yearTextSelected: {
    color: colors.neutral.white,
    fontWeight: '500',
  },
});
