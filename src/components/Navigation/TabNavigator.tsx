import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

// Define the possible tabs
export enum TabRoute {
  Home = 'home',
  Explore = 'explore',
}

interface TabNavigatorProps {
  activeTab: TabRoute;
}

export const TabNavigator: React.FC<TabNavigatorProps> = ({ activeTab }) => {
  const navigateToTab = (tab: TabRoute) => {
    if (tab === activeTab) return; // Don't navigate if we're already on this tab

    router.replace(`/${tab}`);
  };

  return (
    <View style={styles.tabBar}>
      <Pressable
        style={[
          styles.tabItem,
          activeTab === TabRoute.Home && styles.activeTabItem,
        ]}
        onPress={() => navigateToTab(TabRoute.Home)}
      >
        <Ionicons
          name={activeTab === TabRoute.Home ? 'home' : 'home-outline'}
          size={24}
          color={
            activeTab === TabRoute.Home
              ? colors.primary.green
              : colors.text.secondary
          }
        />
        <Text
          style={
            activeTab === TabRoute.Home ? styles.activeTabText : styles.tabText
          }
        >
          Home
        </Text>
      </Pressable>
      <Pressable
        style={[
          styles.tabItem,
          activeTab === TabRoute.Explore && styles.activeTabItem,
        ]}
        onPress={() => navigateToTab(TabRoute.Explore)}
      >
        <Ionicons
          name={activeTab === TabRoute.Explore ? 'grid' : 'grid-outline'}
          size={24}
          color={
            activeTab === TabRoute.Explore
              ? colors.primary.green
              : colors.text.secondary
          }
        />
        <Text
          style={
            activeTab === TabRoute.Explore
              ? styles.activeTabText
              : styles.tabText
          }
        >
          Explore
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: colors.background.secondary,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGrey,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTabItem: {},
  tabText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  activeTabText: {
    fontSize: 12,
    color: colors.primary.green,
    fontWeight: '500',
    marginTop: 2,
  },
});

export default TabNavigator;
