import { useState, useEffect, useCallback, useRef } from 'react';
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
  const lastLoadTime = useRef<number>(0);
  const isInitialized = useRef(false);
  const isLoadingRef = useRef(false);

  const loadChildren = useCallback(async () => {
    if (isLoadingRef.current) {
      console.log('[useAppHeader] Already loading, skipping duplicate call');
      return;
    }

    try {
      setLoading(true);
      isLoadingRef.current = true;
      lastLoadTime.current = Date.now(); // Set timestamp at START of load
      console.log('[useAppHeader] Loading children...');
      const savedChildren = await getChildren();
      if (savedChildren.length > 0) {
        setChildren(savedChildren);
        const activeChild = await resolveActiveChild(savedChildren);
        setSelectedChild(activeChild);
        console.log('[useAppHeader] Set active child:', activeChild?.name);
      } else {
        // If no children, redirect to onboarding
        console.log(
          '[useAppHeader] No children found, redirecting to onboarding'
        );
        router.replace('/onboarding');
      }
    } catch (error) {
      console.error('Error loading children:', error);
      // On error, also redirect
      router.replace('/onboarding');
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  // Load children when the hook is first used
  useEffect(() => {
    isInitialized.current = true; // Set this immediately to prevent useFocusEffect from running
    loadChildren();
  }, [loadChildren]);

  // Refresh children data when the screen comes into focus
  // But only if enough time has passed since the last load (to prevent duplicates)
  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      const timeSinceLastLoad = now - lastLoadTime.current;
      const shouldRefresh = timeSinceLastLoad > 5000; // 5 seconds debounce

      console.log('[useAppHeader] useFocusEffect triggered:', {
        isInitialized: isInitialized.current,
        isLoading: isLoadingRef.current,
        timeSinceLastLoad,
        shouldRefresh,
        lastLoadTime: lastLoadTime.current,
      });

      // Only refresh if we're not in the initial load phase, not currently loading, and enough time has passed
      if (isInitialized.current && !isLoadingRef.current && shouldRefresh) {
        console.log('[useAppHeader] Refreshing children data on focus');
        loadChildren();
      } else {
        console.log('[useAppHeader] Skipping refresh - conditions not met');
      }
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
