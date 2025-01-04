// src/components/Learning/ComplexityIndicator.tsx
import { StyleSheet, View, Text } from 'react-native';
import { colors } from '../../theme/colors';

interface ComplexityIndicatorProps {
  level: number;
}

export function ComplexityIndicator({ level }: ComplexityIndicatorProps) {
  const getComplexityColor = (level: number): string => {
    const complexityColors: Record<number, string> = {
      1: '#4CAF50', // Green
      2: '#8BC34A', // Light Green
      3: '#FFC107', // Amber
      4: '#FF9800', // Orange
      5: '#F44336', // Red
    };
    return complexityColors[level] || complexityColors[3];
  };

  const getComplexityLabel = (level: number): string => {
    const labels: Record<number, string> = {
      1: 'Basic',
      2: 'Standard',
      3: 'Intermediate',
      4: 'Advanced',
      5: 'Challenge',
    };
    return labels[level] || 'Intermediate';
  };

  return (
    <View
      style={[styles.badge, { backgroundColor: getComplexityColor(level) }]}
    >
      <Text style={styles.text}>{getComplexityLabel(level)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8, // Add this line
  },
  text: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
});
