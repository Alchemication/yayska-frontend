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
import { colors, commonStyles } from '../../theme/colors';
import { Child } from '../../types/child';
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

// Helper function to generate child avatar colors
const getChildAvatarColor = (childId: number): string => {
  const colors_list = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FFEAA7',
    '#DDA0DD',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#85C1E9',
  ];
  return colors_list[childId % colors_list.length];
};

// Child Avatar Component
const ChildAvatar: React.FC<{
  child: Child;
  size?: number;
  showBorder?: boolean;
}> = ({ child, size = 32, showBorder = false }) => {
  const backgroundColor = getChildAvatarColor(child.id);
  const initial = child.name.charAt(0).toUpperCase();

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          backgroundColor,
          borderWidth: showBorder ? 2 : 0,
          borderColor: colors.primary.green,
        },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.4 }]}>
        {initial}
      </Text>
    </View>
  );
};

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

  const handleChildSelectorPress = () => {
    if (actualChildrenCount <= 1) {
      // Direct navigation for single child
      router.push('/manage-children');
    } else {
      // Show dropdown for multiple children
      toggleChildrenMenu();
    }
  };

  const handleManageChildren = () => {
    toggleChildrenMenu(); // Close the menu
    router.push('/manage-children');
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
            style={[
              styles.headerLogo,
              showBackButton && styles.headerLogoWithBack,
            ]}
            resizeMode="contain"
          />
        </View>

        <View style={styles.headerRight}>
          {children && children.length > 0 && (
            <Pressable
              style={styles.childSelector}
              onPress={handleChildSelectorPress}
            >
              <View style={styles.childSelectorContent}>
                {selectedChild && (
                  <ChildAvatar
                    child={selectedChild}
                    size={28}
                    showBorder={showChildrenMenu}
                  />
                )}
                <View style={styles.childInfo}>
                  <Text style={styles.selectedChildName}>
                    {selectedChild?.name}
                  </Text>
                  {selectedChild?.year && (
                    <Text style={styles.selectedChildYear}>
                      {selectedChild.year}
                    </Text>
                  )}
                </View>
                {actualChildrenCount > 1 ? (
                  <Ionicons
                    name={showChildrenMenu ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.text.primary}
                    style={styles.childSelectorIcon}
                  />
                ) : (
                  <Ionicons
                    name="settings-outline"
                    size={16}
                    color={colors.text.secondary}
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

      {/* Enhanced Children dropdown */}
      {showChildrenMenu && children && children.length > 0 && (
        <View style={styles.childrenMenu}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>
              {actualChildrenCount > 1 ? 'Select Child' : 'Child Management'}
            </Text>
            <Pressable
              style={styles.manageButton}
              onPress={handleManageChildren}
            >
              <Ionicons
                name="settings-outline"
                size={16}
                color={colors.primary.green}
              />
              <Text style={styles.manageButtonText}>Manage</Text>
            </Pressable>
          </View>

          {actualChildrenCount > 1 &&
            children.map((child) => (
              <Pressable
                key={child.id}
                style={[
                  styles.childMenuItem,
                  selectedChild?.id === child.id &&
                    styles.selectedChildMenuItem,
                ]}
                onPress={() => selectChild(child)}
              >
                <ChildAvatar
                  child={child}
                  size={36}
                  showBorder={selectedChild?.id === child.id}
                />
                <View style={styles.childMenuInfo}>
                  <Text
                    style={[
                      styles.childMenuItemText,
                      selectedChild?.id === child.id &&
                        styles.selectedChildText,
                    ]}
                  >
                    {child.name}
                  </Text>
                  {child.year && (
                    <Text
                      style={[
                        styles.childMenuItemYear,
                        selectedChild?.id === child.id &&
                          styles.selectedChildYearText,
                      ]}
                    >
                      {child.year}
                    </Text>
                  )}
                </View>
                {selectedChild?.id === child.id && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={colors.primary.green}
                  />
                )}
              </Pressable>
            ))}

          {actualChildrenCount === 1 && (
            <View style={styles.singleChildInfo}>
              <Text style={styles.singleChildText}>
                Tap "Manage" to add more children or edit {selectedChild?.name}
                's details.
              </Text>
            </View>
          )}
        </View>
      )}
    </>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  compactHeader: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerLogo: {
    width: 130,
    height: 34,
    marginLeft: 0,
  },
  headerLogoWithBack: {
    width: 110,
    marginLeft: 4,
  },
  backButton: {
    padding: 4,
    width: 24,
  },
  placeholderButton: {
    width: 0,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childSelector: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: commonStyles.borderRadius.medium,
    backgroundColor: colors.background.primary,
    marginRight: 8,
    ...commonStyles.shadow,
  },
  childSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childInfo: {
    marginLeft: 8,
    flex: 1,
  },
  selectedChildName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  selectedChildYear: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 1,
  },
  childSelectorIcon: {
    marginLeft: 6,
  },
  profileButton: {
    padding: 2,
  },

  // Avatar styles
  avatar: {
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.neutral.white,
    fontWeight: '600',
  },

  // Enhanced dropdown styles
  childrenMenu: {
    backgroundColor: colors.background.primary,
    marginHorizontal: 12,
    marginTop: 4,
    borderRadius: commonStyles.borderRadius.medium,
    ...commonStyles.shadow,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGrey,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: commonStyles.borderRadius.small,
    backgroundColor: colors.background.secondary,
  },
  manageButtonText: {
    fontSize: 14,
    color: colors.primary.green,
    fontWeight: '500',
    marginLeft: 4,
  },
  childMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
  },
  selectedChildMenuItem: {
    backgroundColor: colors.background.secondary,
  },
  childMenuInfo: {
    flex: 1,
    marginLeft: 12,
  },
  childMenuItemText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
  },
  childMenuItemYear: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  selectedChildText: {
    fontWeight: '600',
    color: colors.primary.green,
  },
  selectedChildYearText: {
    color: colors.primary.green,
    opacity: 0.8,
  },
  singleChildInfo: {
    padding: 16,
    borderWidth: 1,
    borderColor: colors.neutral.lightGrey,
    borderRadius: commonStyles.borderRadius.medium,
  },
  singleChildText: {
    fontSize: 14,
    color: colors.text.primary,
  },
});
