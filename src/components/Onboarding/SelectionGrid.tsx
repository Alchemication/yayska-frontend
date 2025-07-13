// src/components/Onboarding/SelectionGrid.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, commonStyles } from '../../theme/colors';

export interface SelectionGridItem {
  id: string;
  name: string;
  emoji: string;
  example?: string;
}

interface SelectionGridProps {
  items: SelectionGridItem[];
  selectedItems: string[];
  onToggleItem: (id: string) => void;
  title: string;
  subtitle: string;
  magicRevealText: string | null;
}

export const SelectionGrid: React.FC<SelectionGridProps> = ({
  items,
  selectedItems,
  onToggleItem,
  title,
  subtitle,
  magicRevealText,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.gridContainer}>
        {items.map((item) => {
          const isSelected = selectedItems.includes(item.id);
          return (
            <Pressable
              key={item.id}
              style={[styles.gridItem, isSelected && styles.gridItemSelected]}
              onPress={() => onToggleItem(item.id)}
            >
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text
                style={[styles.itemName, isSelected && styles.itemSelectedName]}
              >
                {item.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.magicRevealContainer}>
        {magicRevealText ? (
          <Text style={styles.magicRevealText}>{magicRevealText}</Text>
        ) : (
          <Text style={styles.magicRevealPlaceholder}>
            Tap an interest to see an example!
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: colors.text.secondary,
    marginBottom: 24,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  gridItem: {
    backgroundColor: colors.background.primary,
    borderRadius: commonStyles.borderRadius.large,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.neutral.lightGrey,
    minWidth: 100,
  },
  gridItemSelected: {
    backgroundColor: colors.primary.green,
    borderColor: colors.primary.green,
  },
  emoji: {
    fontSize: 24,
  },
  itemName: {
    fontSize: 14,
    color: colors.text.primary,
    marginTop: 4,
  },
  itemSelectedName: {
    color: colors.neutral.offWhite,
    fontWeight: '500',
  },
  magicRevealContainer: {
    marginTop: 32,
    backgroundColor: colors.background.secondary,
    borderRadius: commonStyles.borderRadius.medium,
    padding: 16,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  magicRevealText: {
    fontSize: 15,
    color: colors.text.primary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  magicRevealPlaceholder: {
    fontSize: 15,
    color: colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
