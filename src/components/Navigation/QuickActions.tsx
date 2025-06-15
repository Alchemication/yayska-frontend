import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, commonStyles } from '../../theme/colors';

interface QuickActionsProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  isVisible = false,
  onToggle,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleExpanded = () => {
    const toValue = expanded ? 0 : 1;
    setExpanded(!expanded);

    Animated.spring(animation, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handleManageChildren = () => {
    setExpanded(false);
    Animated.spring(animation, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
    router.push('/manage-children');
  };

  const handleAddChild = () => {
    setExpanded(false);
    Animated.spring(animation, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
    router.push('/manage-children');
  };

  const actionScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const actionOpacity = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const mainButtonRotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      {/* Action Items */}
      <Animated.View
        style={[
          styles.actionItem,
          {
            transform: [
              { scale: actionScale },
              {
                translateY: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -60],
                }),
              },
            ],
            opacity: actionOpacity,
          },
        ]}
      >
        <Pressable style={styles.actionButton} onPress={handleManageChildren}>
          <Ionicons
            name="people-outline"
            size={20}
            color={colors.neutral.white}
          />
        </Pressable>
        <Text style={styles.actionLabel}>Manage Children</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.actionItem,
          {
            transform: [
              { scale: actionScale },
              {
                translateY: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -110],
                }),
              },
            ],
            opacity: actionOpacity,
          },
        ]}
      >
        <Pressable style={styles.actionButton} onPress={handleAddChild}>
          <Ionicons
            name="person-add-outline"
            size={20}
            color={colors.neutral.white}
          />
        </Pressable>
        <Text style={styles.actionLabel}>Add Child</Text>
      </Animated.View>

      {/* Main FAB */}
      <Pressable style={styles.fab} onPress={toggleExpanded}>
        <Animated.View
          style={[
            styles.fabIcon,
            {
              transform: [{ rotate: mainButtonRotation }],
            },
          ]}
        >
          <Ionicons name="add" size={24} color={colors.neutral.white} />
        </Animated.View>
      </Pressable>

      {/* Backdrop */}
      {expanded && (
        <Pressable style={styles.backdrop} onPress={toggleExpanded} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90, // Above tab bar
    right: 16,
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: -1,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.green,
    justifyContent: 'center',
    alignItems: 'center',
    ...commonStyles.shadow,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
      },
    }),
  },
  fabIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionItem: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    alignItems: 'center',
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  actionLabel: {
    fontSize: 12,
    color: colors.text.primary,
    fontWeight: '500',
    backgroundColor: colors.background.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: commonStyles.borderRadius.small,
    textAlign: 'center',
    minWidth: 80,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
      },
    }),
  },
});
