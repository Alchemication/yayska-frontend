import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect, router } from 'expo-router';
import { Child, getChildren } from '../utils/storage';
import { resolveActiveChild, setActiveChild } from '../utils/activeChild';
import { trackEvent } from '../utils/analytics';

export const useAppHeader = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [showChildrenMenu, setShowChildrenMenu] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadChildren = useCallback(async () => {
    try {
      setLoading(true);
      const savedChildren = await getChildren();
      if (savedChildren.length > 0) {
        setChildren(savedChildren);
        const activeChild = await resolveActiveChild(savedChildren);
        setSelectedChild(activeChild);
      } else {
        // If no children, redirect to onboarding
        router.replace('/onboarding');
      }
    } catch (error) {
      console.error('Error loading children:', error);
      // On error, also redirect
      router.replace('/onboarding');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load children when the hook is first used
  useEffect(() => {
    loadChildren();
  }, [loadChildren]);

  // Refresh children data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadChildren();
    }, [loadChildren])
  );

  const toggleChildrenMenu = () => {
    setShowChildrenMenu((prev) => !prev);
  };

  const selectChild = async (child: Child) => {
    if (selectedChild?.id === child.id) {
      setShowChildrenMenu(false);
      return;
    }

    const previousChild = selectedChild;
    setSelectedChild(child);
    setShowChildrenMenu(false);

    try {
      await setActiveChild(child);
      await trackEvent('CHILD_SWITCHED', {
        from_child_year: previousChild?.year,
        to_child_year: child.year,
        children_count: children.length,
      });
      // Per product decision, always redirect to home on child change
      router.replace('/home');
    } catch (error) {
      console.error('Failed to set active child or track event:', error);
    }
  };

  const toggleUserProfile = () => {
    setShowUserProfile((prev) => !prev);
  };

  return {
    children,
    selectedChild,
    showChildrenMenu,
    showUserProfile,
    loading,
    toggleChildrenMenu,
    selectChild,
    toggleUserProfile,
  };
};
