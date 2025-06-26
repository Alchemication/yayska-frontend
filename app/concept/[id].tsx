// app/concept/[id].tsx
import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  StyleSheet,
  ScrollView,
  Text,
  ActivityIndicator,
  View,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { ConceptDetailCard } from '../../src/components/Concept/ConceptDetailCard';
import { colors } from '../../src/theme/colors';
import { api } from '../../src/services/api';
import { ConceptMetadata } from '../../src/types/concept';
import { AppHeader } from '../../src/components/Navigation/AppHeader';
import { UserProfile } from '../../src/components/Auth/UserProfile';
import { Child, getChildren } from '../../src/utils/storage';
import { trackEvent } from '../../src/utils/analytics';
import { chatApi } from '../../src/services/chatApi';
import { EntryPointType } from '../../src/types/chat';
import { resolveActiveChild } from '../../src/utils/activeChild';
import { Ionicons } from '@expo/vector-icons';
import { crossPlatformAlert } from '../../src/utils/crossPlatformAlert';

export default function ConceptDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string>('why');
  const [concept, setConcept] = useState<ConceptMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [showChildrenMenu, setShowChildrenMenu] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Function to toggle children menu
  const toggleChildrenMenu = () => {
    setShowChildrenMenu(!showChildrenMenu);
  };

  // Function to select a child
  const selectChild = (child: Child) => {
    setSelectedChild(child);
    setShowChildrenMenu(false);
  };

  // Function to toggle user profile
  const toggleUserProfile = () => {
    setShowUserProfile(!showUserProfile);
  };

  // Track section changes
  const handleSectionChange = (section: string) => {
    const changeId = Math.random().toString(36).substr(2, 9);
    console.log(`[CONCEPT-${changeId}] 🔄 Section change triggered:`, {
      from: activeSection,
      to: section,
      conceptId: Number(id),
      conceptName: concept?.concept_name,
    });

    // Track the section switch
    trackEvent('CONCEPT_SECTION_SWITCHED', {
      concept_id: Number(id),
      concept_name: concept?.concept_name,
      from_section: activeSection,
      to_section: section,
    });

    console.log(
      `[CONCEPT-${changeId}] 🎯 trackEvent called, updating state...`
    );
    setActiveSection(section);
    console.log(`[CONCEPT-${changeId}] ✅ State updated to:`, section);
  };

  useEffect(() => {
    const loadConcept = async () => {
      try {
        setLoading(true);
        const data = await api.getConceptMetadata(Number(id));
        setConcept(data as ConceptMetadata);

        // Track concept view - only when concept is first loaded
        await trackEvent('CONCEPT_VIEW', {
          concept_id: Number(id),
          concept_name: data.concept_name,
          initial_section: activeSection,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load concept');

        // Track concept load error
        await trackEvent('CONCEPT_LOAD_ERROR', {
          concept_id: Number(id),
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      } finally {
        setLoading(false);
      }
    };

    loadConcept();
  }, [id]); // Only depend on id, not activeSection

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const childrenData = await getChildren();
        setChildren(childrenData);

        if (childrenData.length > 0) {
          const activeChild = await resolveActiveChild(childrenData);
          setSelectedChild(activeChild);
        } else {
          // Handle case where no children are registered
          router.replace('/onboarding');
        }
      } catch (error) {
        console.error('Failed to load children:', error);
        crossPlatformAlert('Error', 'Failed to load children data.');
      }
    };
    fetchChildren();
  }, [router]);

  const handleOpenChat = async () => {
    if (!concept || !selectedChild) {
      crossPlatformAlert('Error', 'Please select a child first.');
      return;
    }

    setIsChatLoading(true);
    try {
      // Track chat initiation
      await trackEvent('CHAT_INITIATED', {
        concept_id: concept.concept_id,
        concept_name: concept.concept_name,
        section: activeSection,
        child_id: selectedChild.id,
        entry_point: 'concept_detail_fab',
      });

      const session = await chatApi.findOrCreateSession({
        child_id: selectedChild.id,
        entry_point_type: EntryPointType.CONCEPT_COACH,
        context_data: {
          concept_id: concept.concept_id,
          concept_name: concept.concept_name,
          section: activeSection,
        },
      });

      router.push({
        pathname: `/chat/${session.id}`,
        params: {
          conceptName: concept.concept_name,
          conceptDescription: concept.concept_description,
        },
      });
    } catch (error: any) {
      console.error('Failed to create or find chat session', error);

      let errorMessage =
        'Could not start a chat session. Please try again later.';

      if (error.status === 429) {
        errorMessage =
          error.data?.error?.message ||
          'You have reached your daily chat limit.';
      } else if (error.status >= 500) {
        errorMessage =
          'Our servers are currently busy. Please try again in a few moments.';
      }

      crossPlatformAlert('Error', errorMessage);

      // Track chat initiation failure
      await trackEvent('CHAT_INITIATION_FAILED', {
        concept_id: concept.concept_id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsChatLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={colors.primary.green} />
          <Text style={styles.loadingText}>Loading concept...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setLoading(true);
              // Trigger reload
              const loadConcept = async () => {
                try {
                  const data = await api.getConceptMetadata(Number(id));
                  setConcept(data as ConceptMetadata);
                } catch (err) {
                  setError(
                    err instanceof Error
                      ? err.message
                      : 'Failed to load concept'
                  );
                } finally {
                  setLoading(false);
                }
              };
              loadConcept();
            }}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!concept) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredContainer}>
          <Text style={styles.errorText}>Concept not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background.primary }}
    >
      <View style={styles.container}>
        <AppHeader
          children={children}
          selectedChild={selectedChild}
          showChildrenMenu={showChildrenMenu}
          toggleChildrenMenu={toggleChildrenMenu}
          selectChild={selectChild}
          toggleUserProfile={toggleUserProfile}
          showBackButton={true}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
        >
          <ConceptDetailCard
            concept={concept}
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
          />
        </ScrollView>

        {showUserProfile && (
          <View style={styles.profileOverlay}>
            <UserProfile
              isVisible={showUserProfile}
              onClose={() => setShowUserProfile(false)}
            />
          </View>
        )}

        {/* Enhanced Chat FAB with better UX */}
        <Pressable
          style={[
            styles.fab,
            isChatLoading && styles.fabLoading,
            !selectedChild && styles.fabDisabled,
          ]}
          onPress={handleOpenChat}
          disabled={isChatLoading || !selectedChild}
          accessibilityLabel="Chat with Yay about this concept"
          accessibilityHint="Opens a chat to ask questions about this learning concept"
        >
          {isChatLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
              {/* Small badge to indicate it's "Yay" */}
              <View style={styles.fabBadge}>
                <Text style={styles.fabBadgeText}>Yay</Text>
              </View>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text.secondary,
  },
  errorText: {
    color: colors.accent.error,
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary.green,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  profileOverlay: {
    position: 'absolute',
    top: 60,
    right: 16,
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  contentContainer: {
    padding: 0,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary.green,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabLoading: {
    backgroundColor: colors.primary.greenLight,
  },
  fabDisabled: {
    backgroundColor: colors.background.tertiary,
    opacity: 0.6,
  },
  fabBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary.orange,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
  },
  fabBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});
