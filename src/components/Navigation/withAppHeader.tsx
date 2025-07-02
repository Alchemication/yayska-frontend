import React, { useState, useEffect, useCallback, ComponentType } from 'react';
import { useFocusEffect, router } from 'expo-router';
import { getChildren, Child } from '../../utils/storage';
import { resolveActiveChild, setActiveChild } from '../../utils/activeChild';
import { trackEvent } from '../../utils/analytics';
import { AppHeader } from './AppHeader';
import { useAuth } from '../../context/AuthContext';
import { View } from 'react-native';
import { UserProfile } from '../Auth/UserProfile';

export interface WithAppHeaderProps {
  selectedChild: Child | null;
  children: Child[] | null;
  refreshChildren: () => Promise<void>;
}

export const withAppHeader = <P extends object>(
  WrappedComponent: ComponentType<P & WithAppHeaderProps>
) => {
  const WithAppHeader = (props: P) => {
    const { user, isAuthenticated } = useAuth();
    const [children, setChildren] = useState<Child[]>([]);
    const [selectedChild, setSelectedChild] = useState<Child | null>(null);
    const [showChildrenMenu, setShowChildrenMenu] = useState(false);
    const [showUserProfile, setShowUserProfile] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadChildren = async () => {
      try {
        setLoading(true);
        const savedChildren = await getChildren();
        if (savedChildren.length > 0) {
          setChildren(savedChildren);
          const activeChild = await resolveActiveChild(savedChildren);
          setSelectedChild(activeChild);
        } else {
          router.replace('/onboarding');
        }
      } catch (error) {
        console.error('Error loading children:', error);
        router.replace('/onboarding');
      } finally {
        setLoading(false);
      }
    };

    const refreshChildren = useCallback(async () => {
      await loadChildren();
    }, []);

    useFocusEffect(
      useCallback(() => {
        refreshChildren();
      }, [refreshChildren])
    );

    const toggleChildrenMenu = () => {
      setShowChildrenMenu(!showChildrenMenu);
    };

    const selectChild = async (child: Child) => {
      const previousChild = selectedChild;
      if (previousChild?.id === child.id) {
        setShowChildrenMenu(false);
        return;
      }
      setSelectedChild(child);
      setShowChildrenMenu(false);
      await trackEvent('CHILD_SWITCHED', {
        from_child_year: previousChild?.year,
        to_child_year: child.year,
        children_count: children.length,
      });
      await setActiveChild(child);
    };

    const toggleUserProfile = () => {
      setShowUserProfile(!showUserProfile);
    };

    const componentProps: WithAppHeaderProps = {
      selectedChild,
      children,
      refreshChildren,
    };

    return (
      <View style={{ flex: 1 }}>
        <AppHeader
          children={children}
          selectedChild={selectedChild}
          showChildrenMenu={showChildrenMenu}
          toggleChildrenMenu={toggleChildrenMenu}
          selectChild={selectChild}
          toggleUserProfile={toggleUserProfile}
          childrenCount={children.length}
        />
        <UserProfile
          isVisible={showUserProfile}
          onClose={() => setShowUserProfile(false)}
        />
        <WrappedComponent {...props} {...componentProps} />
      </View>
    );
  };

  return WithAppHeader;
};
