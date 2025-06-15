import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import { Child } from '../../types/child';

interface ChildrenDropdownProps {
  children: Child[];
  selectedChild: Child | null;
  onSelectChild: (child: Child) => void;
}

export const ChildrenDropdown: React.FC<ChildrenDropdownProps> = ({
  children,
  selectedChild,
  onSelectChild,
}) => {
  return (
    <View style={styles.childrenMenu}>
      {children.map((child) => (
        <Pressable
          key={child.id}
          style={styles.childMenuItem}
          onPress={() => onSelectChild(child)}
        >
          <Text
            style={[
              styles.childMenuItemText,
              selectedChild?.id === child.id && styles.selectedChildText,
            ]}
          >
            {child.name}
            {child.year && <Text> ({child.year})</Text>}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  childrenMenu: {
    backgroundColor: colors.background.secondary,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  childMenuItem: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
  },
  childMenuItemText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  selectedChildText: {
    fontWeight: '600',
    color: colors.primary.green,
  },
});

export default ChildrenDropdown;
