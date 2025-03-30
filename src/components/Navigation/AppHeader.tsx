import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '../../theme/colors';
import { Child } from '../../utils/storage';
import { getChildDisplayName } from '../../utils/childDisplayUtils';
import { useAuth } from '../../context/AuthContext';

interface AppHeaderProps {
  children: Child[] | null;
  selectedChild: Child | null;
  showChildrenMenu: boolean;
  toggleChildrenMenu: () => void;
  selectChild: (child: Child) => void;
  toggleUserProfile: () => void;
  showBackButton?: boolean;
  backButtonDestination?: string;
  childrenCount?: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  children,
  selectedChild,
  showChildrenMenu,
  toggleChildrenMenu,
  selectChild,
  toggleUserProfile,
  showBackButton = false,
  backButtonDestination,
  childrenCount = 0,
}: AppHeaderProps) => {
  const { isAuthenticated } = useAuth();

  const handleBack = () => {
    if (backButtonDestination) {
      router.replace(backButtonDestination);
    } else {
      router.back();
    }
  };

  // Use either the provided childrenCount or children.length
  const actualChildrenCount = childrenCount || (children ? children.length : 0);

  return (
    <>
      <View style={styles.compactHeader}>
        <View style={styles.headerLeft}>
          {showBackButton ? (
            <Pressable style={styles.backButton} onPress={handleBack}>
              <Ionicons
                name="arrow-back"
                size={24}
                color={colors.text.primary}
              />
            </Pressable>
          ) : (
            <View style={styles.placeholderButton} />
          )}

          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.headerRight}>
          {children && children.length > 0 && (
            <Pressable
              style={styles.childSelector}
              onPress={toggleChildrenMenu}
              disabled={actualChildrenCount <= 1}
            >
              <View style={styles.childSelectorContent}>
                <Text style={styles.selectedChildName}>
                  {getChildDisplayName(selectedChild)}
                </Text>
                {actualChildrenCount > 1 && (
                  <Ionicons
                    name={showChildrenMenu ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.text.primary}
                    style={styles.childSelectorIcon}
                  />
                )}
              </View>
            </Pressable>
          )}

          <Pressable style={styles.profileButton} onPress={toggleUserProfile}>
            <Ionicons
              name={isAuthenticated ? 'person-circle' : 'person-circle-outline'}
              size={24}
              color={
                isAuthenticated ? colors.primary.green : colors.text.secondary
              }
            />
          </Pressable>
        </View>
      </View>

      {/* Children dropdown */}
      {showChildrenMenu && children && children.length > 0 && (
        <View style={styles.childrenMenu}>
          {children.map((child) => (
            <Pressable
              key={child.id}
              style={styles.childMenuItem}
              onPress={() => selectChild(child)}
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
      )}
    </>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  compactHeader: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 150,
    height: 40,
    marginLeft: 8,
  },
  backButton: {
    padding: 4,
    width: 32,
  },
  placeholderButton: {
    width: 32,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childSelector: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: colors.background.tertiary,
    marginRight: 8,
  },
  childSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedChildName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  childSelectorIcon: {
    marginLeft: 4,
  },
  profileButton: {
    padding: 4,
  },
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
