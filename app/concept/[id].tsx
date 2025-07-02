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
import { trackEvent } from '../../src/utils/analytics';
import { chatApi } from '../../src/services/chatApi';
import { EntryPointType } from '../../src/types/chat';
import { Ionicons } from '@expo/vector-icons';
import { crossPlatformAlert } from '../../src/utils/crossPlatformAlert';
import { useAppHeader } from '../../src/hooks/useAppHeader';

export default function ConceptDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    children,
    selectedChild,
    showChildrenMenu,
    showUserProfile,
    toggleChildrenMenu,
    selectChild,
    toggleUserProfile,
  } = useAppHeader();
  const [activeSection, setActiveSection] = useState<string>('why');
  const [concept, setConcept] = useState<ConceptMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleSectionChange = (section: string) => {
    const changeId = Math.random().toString(36).substr(2, 9);
    console.log(`[CONCEPT-${changeId}] 🔄 Section change triggered:`, {
      from: activeSection,
      to: section,
      conceptId: Number(id),
      conceptName: concept?.concept_name,
    });

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

        await trackEvent('CONCEPT_VIEW', {
          concept_id: Number(id),
          concept_name: data.concept_name,
          initial_section: activeSection,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load concept');

        await trackEvent('CONCEPT_LOAD_ERROR', {
          concept_id: Number(id),
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      } finally {
        setLoading(false);
      }
    };

    loadConcept();
  }, [id]);

  const handleOpenChat = async () => {
    if (!concept || !selectedChild) {
      crossPlatformAlert('Error', 'Please select a child first.');
      return;
    }

    setIsChatLoading(true);
    try {
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
      <AppHeader
        children={children}
        selectedChild={selectedChild}
        showChildrenMenu={showChildrenMenu}
        toggleChildrenMenu={toggleChildrenMenu}
        selectChild={selectChild}
        toggleUserProfile={toggleUserProfile}
        showBackButton={true}
      />

      <ScrollView style={styles.container}>
        <ConceptDetailCard
          concept={concept}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />
      </ScrollView>

      <Pressable style={styles.fab} onPress={handleOpenChat}>
        {isChatLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Ionicons name="chatbubbles-outline" size={28} color="#fff" />
        )}
      </Pressable>

      {showUserProfile && (
        <View style={styles.profileOverlay}>
          <UserProfile
            isVisible={showUserProfile}
            onClose={toggleUserProfile}
          />
        </View>
      )}
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
  errorText: {
    fontSize: 16,
    color: colors.accent.error,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.text.secondary,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: colors.primary.green,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: colors.primary.green,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  profileOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
});
